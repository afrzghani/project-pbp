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
        if ($note->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        if (Storage::disk(config('filesystems.default'))->exists($attachment->file_path)) {
            Storage::disk(config('filesystems.default'))->delete($attachment->file_path);
        }

        $attachment->delete();

        return back()->with('flash.banner', 'Lampiran berhasil dihapus.');
    }
}
