<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Services\Ai\NoraChat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiChatController extends Controller
{
    public function __construct(
        private NoraChat $chatService
    ) {}
    public function chat(Request $request, Note $note): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'required|string|max:500',
            'history' => 'nullable|array|max:20',
            'history.*.role' => 'sometimes|string|in:user,assistant',
            'history.*.content' => 'sometimes|string|max:1000',
        ]);

        $reply = $this->chatService->chat(
            $note,
            $validated['message'],
            $validated['history'] ?? []
        );

        return response()->json([
            'reply' => $reply,
        ]);
    }
}
