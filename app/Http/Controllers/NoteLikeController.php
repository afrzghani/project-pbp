<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoteLikeController extends Controller
{
    public function store(Request $request, Note $note): JsonResponse
    {
        $this->ensureInteractable($request, $note);

        $note->likes()->firstOrCreate([
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'liked' => true,
            'likes_count' => $note->likes()->count(),
        ]);
    }

    public function destroy(Request $request, Note $note): JsonResponse
    {
        $this->ensureInteractable($request, $note);

        $note->likes()
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json([
            'liked' => false,
            'likes_count' => $note->likes()->count(),
        ]);
    }

    protected function ensureInteractable(Request $request, Note $note): void
    {
        abort_if(! $note->isInteractableBy($request->user()), 403, 'Catatan tidak tersedia.');
        abort_if(! $note->isPublic(), 403, 'Catatan belum dipublikasikan.');
    }
}

