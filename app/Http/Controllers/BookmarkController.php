<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookmarkController extends Controller
{
    public function index(Request $request): Response
    {
        $bookmarks = $request->user()->bookmarks()
            ->with(['note' => function ($query) {
                $query->with(['user', 'tags', 'university', 'programStudy'])
                    ->withCount(['comments', 'likes', 'bookmarks']);
            }])
            ->latest()
            ->paginate(12);

        // Transform to just the notes, but keep pagination meta if needed, 
        // or just map the notes. 
        // Logic: The relationship returns NoteBookmark models, we want the notes.
        
        $notes = $bookmarks->through(function ($bookmark) {
            return $bookmark->note;
        });

        return Inertia::render('bookmarks', [
            'notes' => $notes,
        ]);
    }
}
