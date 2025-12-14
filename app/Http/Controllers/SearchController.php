<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SearchController extends Controller
{
    public function results(Request $request)
    {
        $q = $request->query('q', '');
        $notes = [];
        if ($q) {
            $notes = Note::query()
                ->where('visibility', 'public')
                ->where('status', 'published')
                ->where(function($query) use ($q) {
                    $query->where('title', 'like', "%$q%")
                          ->orWhere('content_text', 'like', "%$q%")
                          ->orWhere('content_html', 'like', "%$q%")
                    ;
                })
                ->with([
                    'user:id,name,avatar,university_id,program_study_id',
                    'user.university:id,nama,singkatan',
                    'user.programStudy:id,nama',
                    'tags:id,name,slug',
                ])
                ->withCount([
                    'likes',
                    'comments',
                    'bookmarks as bookmarks_count',
                ])
                ->orderByDesc('published_at')
                ->orderByDesc('created_at')
                ->limit(30)
                ->get()
                ->map(function ($note) {
                    return [
                        'id' => $note->id,
                        'slug' => $note->slug,
                        'title' => $note->title,
                        'excerpt' => $note->excerpt ?: \Illuminate\Support\Str::limit($note->content_text ?? '', 140),
                        'ai_summary' => $note->ai_summary,
                        'ai_flashcards_count' => is_array($note->ai_flashcards) ? count($note->ai_flashcards) : 0,
                        'user' => [
                            'id' => $note->user->id,
                            'name' => $note->user->name,
                            'avatar_url' => $note->user->avatar_url,
                            'program_study' => $note->user->programStudy?->nama,
                            'university' => $note->user->university?->nama,
                            'university_short' => $note->user->university?->singkatan,
                        ],
                        'tags' => $note->tags->map(fn ($tag) => [
                            'id' => $tag->id,
                            'name' => $tag->name,
                            'slug' => $tag->slug,
                        ]),
                        'liked' => false,
                        'likes_count' => $note->likes_count ?? 0,
                        'comments_count' => $note->comments_count ?? 0,
                        'bookmarked' => false,
                        'bookmarks_count' => $note->bookmarks_count ?? 0,
                        'published_at' => optional($note->published_at)->toIso8601String(),
                        'created_at' => optional($note->created_at)->toIso8601String(),
                        'updated_at' => optional($note->updated_at)->diffForHumans(),
                    ];
                });
        }
        return Inertia::render('search-hasil', [
            'q' => $q,
            'results' => $notes,
        ]);
    }
}
