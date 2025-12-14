<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookmarkController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        $bookmarks = $user->bookmarks()
            ->with(['note' => function ($query) {
                $query->with(['user.programStudy', 'tags'])
                    ->withCount(['comments', 'likes', 'bookmarks']);
            }])
            ->latest()
            ->paginate(12);
        $notes = $bookmarks->through(function ($bookmark) use ($user) {
            $note = $bookmark->note;
            if (!$note) {
                return [
                    'id' => 0,
                    'slug' => '',
                    'title' => 'Note not found',
                    'user' => ['id' => 0, 'name' => ''],
                    'tags' => [],
                    'liked' => false,
                    'likes_count' => 0,
                    'comments_count' => 0,
                    'bookmarked' => false,
                    'bookmarks_count' => 0,
                ];
            }
            
            return [
                'id' => $note->id,
                'slug' => $note->slug,
                'title' => $note->title,
                'excerpt' => $note->excerpt,
                'ai_summary' => $note->ai_summary,
                'user' => [
                    'id' => $note->user->id,
                    'name' => $note->user->name,
                    'program_study' => $note->user->programStudy?->nama,
                    'avatar_url' => $note->user->avatar_url,
                ],
                'tags' => $note->tags->map(fn($tag) => [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                ])->toArray(),
                'liked' => $note->likes()->where('user_id', $user->id)->exists(),
                'likes_count' => $note->likes_count,
                'comments_count' => $note->comments_count,
                'bookmarked' => true,
                'bookmarks_count' => $note->bookmarks_count,
            ];
        });

        return Inertia::render('bookmarks', [
            'notes' => $notes,
        ]);
    }
}
