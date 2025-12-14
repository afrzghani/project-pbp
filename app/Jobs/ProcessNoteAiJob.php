<?php

namespace App\Jobs;

use App\Models\Note;
use App\Services\Ai\NoraNote;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessNoteAiJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $noteId,
        public bool $force = false
    ) {
    }

    public function handle(NoraNote $noraNote): void
    {
        $note = Note::find($this->noteId);

        if (! $note) {
            return;
        }

        $note->ai_status = 'processing';
        $note->save();

        try {
            $noraNote->process($note);
        } catch (\Throwable $exception) {
            Log::error('AI processing failed', [
                'note_id' => $note->id,
                'message' => $exception->getMessage(),
            ]);

            $note->ai_status = 'failed';
            $note->save();

            return;
        }

        $note->ai_status = 'completed';
        $note->ai_completed_at = now();
        $note->save();
    }
}
