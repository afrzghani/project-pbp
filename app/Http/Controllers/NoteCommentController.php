<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\NoteComment;
use App\Models\Notification;
use App\Services\BadgeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoteCommentController extends Controller
{
    public function index(Request $request, Note $note): JsonResponse
    {
        $this->ensureCanView($request, $note);

        $comments = $note->comments()
            ->with('user:id,name,avatar')
            ->where('status', 'published')
            ->latest()
            ->get()
            ->map(fn (NoteComment $comment) => $this->transformComment($comment));

        return response()->json(['data' => $comments]);
    }

    public function store(Request $request, Note $note): JsonResponse
    {
        $this->ensureInteractable($request, $note);

        $data = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
            'parent_id' => ['nullable', 'exists:note_comments,id'],
        ]);

        if (! empty($data['parent_id'])) {
            $isSameNote = NoteComment::where('id', $data['parent_id'])
                ->where('note_id', $note->id)
                ->exists();

            abort_if(! $isSameNote, 422, 'Komentar induk tidak valid.');
        }

        $comment = $note->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $data['body'],
            'parent_id' => $data['parent_id'] ?? null,
            'status' => 'published',
        ]);


        Notification::createForComment(
            $note->user_id,
            $request->user()->id,
            $note->id,
            $comment->id
        );

        $badgeService = app(BadgeService::class);
        $badgeService->checkAndAward($request->user(), 'comment_written');

        if ($note->user_id !== $request->user()->id) {
            $badgeService->checkAndAward($note->user, 'comment_received');
        }

        return response()->json([
            'data' => $this->transformComment($comment->load('user:id,name,avatar')),
        ], 201);
    }

    public function destroy(Request $request, Note $note, NoteComment $comment): JsonResponse
    {
        abort_if($comment->note_id !== $note->id, 404);
        $this->ensureCanDelete($request, $note, $comment);

        $comment->delete();

        return response()->json(['deleted' => true]);
    }

    protected function ensureInteractable(Request $request, Note $note): void
    {
        $user = $request->user();
        
        if ($note->user_id === $user->id) {
            return;
        }
        
        abort_if(! $note->isInteractableBy($user), 403, 'Catatan tidak tersedia.');
        abort_if(! $note->isPublic(), 403, 'Catatan belum dipublikasikan.');
    }

    protected function ensureCanView(Request $request, Note $note): void
    {
        abort_if(! $note->isInteractableBy($request->user()), 403, 'Catatan tidak tersedia.');
    }

    protected function ensureCanDelete(Request $request, Note $note, NoteComment $comment): void
    {
        abort_if(
            $comment->user_id !== $request->user()->id && $note->user_id !== $request->user()->id,
            403,
            'Tidak memiliki akses.'
        );
    }

    protected function transformComment(NoteComment $comment): array
    {
        return [
            'id' => $comment->id,
            'body' => $comment->body,
            'user' => [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
                'avatar_url' => $comment->user->avatar_url,
            ],
            'created_at' => $comment->created_at?->toIso8601String(),
        ];
    }
}

