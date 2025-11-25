<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FlashcardController extends Controller
{
    public function index(Request $request): Response
    {
        $notes = $request->user()
            ->notes()
            ->with(['programStudy:id,nama'])
            ->whereNotNull('ai_flashcards')
            ->whereJsonLength('ai_flashcards', '>', 0)
            ->latest('ai_completed_at')
            ->get(['id', 'title', 'ai_flashcards', 'program_study_id', 'ai_completed_at'])
            ->map(function (Note $note) {
                $flashcards = collect($note->ai_flashcards ?? [])
                    ->filter(fn ($card) => filled($card['question'] ?? null) && filled($card['answer'] ?? null))
                    ->values()
                    ->all();

                return [
                    'id' => $note->id,
                    'title' => $note->title,
                    'program_study' => $note->programStudy
                        ? [
                            'id' => $note->programStudy->id,
                            'nama' => $note->programStudy->nama,
                        ]
                        : null,
                    'flashcards' => $flashcards,
                    'ai_completed_at' => optional($note->ai_completed_at)->toDateTimeString(),
                ];
            })
            ->filter(fn ($note) => count($note['flashcards']) > 0)
            ->values();

        return Inertia::render('flashcards/index', [
            'notes' => $notes,
        ]);
    }
}




