<?php

namespace App\Jobs;

use App\Models\Note;
use App\Services\Notion\NotionSyncService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncNotionNoteJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $noteId)
    {
    }

    public function handle(NotionSyncService $service): void
    {
        $note = Note::with('user.notionConnection')->find($this->noteId);

        if (! $note) {
            return;
        }

        try {
            $service->sync($note);
            $note->sync_status = 'completed';
            $note->synced_at = now();
        } catch (\Throwable $exception) {
            Log::error('Notion sync failed', [
                'note_id' => $note->id,
                'message' => $exception->getMessage(),
            ]);

            $note->sync_status = 'failed';
        }

        $note->save();
    }
}
