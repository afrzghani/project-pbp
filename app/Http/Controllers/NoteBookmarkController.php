<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\NoteBookmark;
use App\Models\Notification;
use App\Services\BadgeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoteBookmarkController extends Controller
{
    public function store(Request $request, Note $note): JsonResponse
    {
        abort_if(! $note->isPublic(), 403, 'Catatan belum dipublikasikan.');

        $user = $request->user();

        $bookmark = NoteBookmark::firstOrCreate([
            'user_id' => $user->id,
            'note_id' => $note->id,
        ]);


        if ($bookmark->wasRecentlyCreated) {
            Notification::createForBookmark(
                $note->user_id,
                $user->id,
                $note->id
            );

            $badgeService = app(BadgeService::class);
            $badgeService->checkAndAward($note->user, 'bookmark_received');
        }

        return response()->json([
            'bookmarked' => true,
            'bookmarks_count' => $note->bookmarks()->count(),
        ]);
    }

    public function destroy(Request $request, Note $note): JsonResponse
    {
        $user = $request->user();

        NoteBookmark::where('user_id', $user->id)
            ->where('note_id', $note->id)
            ->delete();

        return response()->json([
            'bookmarked' => false,
            'bookmarks_count' => $note->bookmarks()->count(),
        ]);
    }
}
