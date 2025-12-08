<?php

namespace App\Http\Controllers;

use App\Models\NoteAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class NoteAttachmentController extends Controller
{
    public function destroy(NoteAttachment $attachment)
    {
        $note = $attachment->note;
        // Authorization check: Ensure user owns the note
        if ($note->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // Delete file from storage
        if (Storage::disk(config('filesystems.default'))->exists($attachment->file_path)) {
            Storage::disk(config('filesystems.default'))->delete($attachment->file_path);
        }

        // Delete record from database
        $attachment->delete();

        return back()->with('flash.banner', 'Lampiran berhasil dihapus.');
    }
}
