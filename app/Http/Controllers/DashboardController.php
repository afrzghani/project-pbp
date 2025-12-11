<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Note;
use App\Models\NoteView;
use App\Models\ProgramStudy;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $streak = $this->calculateStreak($user);

        $notesThisWeek = Note::where('user_id', $user->id)
            ->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->count();

        $leaderboard = $this->getProgramStudyLeaderboard($user);

        // Recently Viewed Notes (from note_views table)
        $viewedNoteIds = NoteView::where('user_id', $user->id)
            ->orderByDesc('viewed_at')
            ->limit(3)
            ->pluck('note_id');

        $recentNotes = Note::whereIn('id', $viewedNoteIds)
            ->with(['user', 'tags'])
            ->withCount(['likes', 'comments', 'bookmarks'])
            ->get()
            ->sortBy(function ($note) use ($viewedNoteIds) {
                return array_search($note->id, $viewedNoteIds->toArray());
            })
            ->values()
            ->map(fn ($note) => $this->transformNote($note));

        // Bookmarked Notes
        $bookmarkedNotes = Note::whereHas('bookmarks', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->with(['user', 'tags']) // Eager load relationships
            ->withCount(['likes', 'comments', 'bookmarks'])
            ->orderByDesc('created_at') // Or bookmark timestamp if available via pivot
            ->limit(3)
            ->get()
            ->map(fn ($note) => $this->transformNote($note));

        return Inertia::render('dashboard', [
            'stats' => [
                'streak' => $streak,
                'notes_this_week' => $notesThisWeek,
                'leaderboard' => $leaderboard,
            ],
            'recent_notes' => $recentNotes,
            'bookmarked_notes' => $bookmarkedNotes,
        ]);
    }

    public function explore(Request $request): Response
    {
        $user = $request->user();
        $filters = $this->resolveFilters($request, $user);
        $feed = $this->buildFeed($request, $filters);

        return Inertia::render('explore', [
            'feed' => $feed,
            'filters' => $filters,
        ]);
    }

    private function calculateStreak(User $user): int
    {
        $today = Carbon::today();
        $streak = 0;
        $currentDate = $today->copy();

        $hasActivityToday = ActivityLog::where('user_id', $user->id)
            ->where('activity_date', $today)
            ->exists();

        if (! $hasActivityToday) {
            $currentDate = $today->copy()->subDay();
        }

        while (true) {
            $hasActivity = ActivityLog::where('user_id', $user->id)
                ->where('activity_date', $currentDate)
                ->exists();

            if (! $hasActivity) {
                break;
            }

            $streak++;
            $currentDate->subDay();
        }

        return $streak;
    }

    private function getProgramStudyLeaderboard(User $user): array
    {
        if (! $user->program_study_id) {
            return [
                'program_study' => null,
                'top_users' => [],
            ];
        }

        $topUsers = Note::selectRaw('user_id, COUNT(*) as notes_count')
            ->where('program_study_id', $user->program_study_id)
            ->groupBy('user_id')
            ->orderByDesc('notes_count')
            ->with(['user:id,name'])
            ->limit(5)
            ->get()
            ->map(function ($row, $index) {
                return [
                    'id' => $row->user_id,
                    'name' => $row->user?->name ?? 'Mahasiswa',
                    'rank' => $index + 1,
                    'notes_count' => (int) $row->notes_count,
                ];
            });

        $programStudy = ProgramStudy::with('university')
            ->find($user->program_study_id);

        return [
            'program_study' => $programStudy ? [
                'id' => $programStudy->id,
                'nama' => $programStudy->nama,
                'university' => $programStudy->university ? [
                    'id' => $programStudy->university->id,
                    'nama' => $programStudy->university->nama,
                ] : null,
            ] : null,
            'top_users' => $topUsers,
        ];
    }

    private function resolveFilters(Request $request, User $user): array
    {
        return [
            'search' => trim((string) $request->query('search', '')),
        ];
    }

    private function buildFeed(Request $request, array $filters)
    {
        $user = $request->user();

        $query = Note::query()
            ->visiblePublic()
            ->with([
                'user:id,name,university_id,program_study_id',
                'user.university:id,nama,singkatan',
                'user.programStudy:id,nama',
                'tags:id,name,slug',
            ])
            ->withCount([
                'likes',
                'comments',
                'bookmarks as bookmarks_count',
            ])
            ->withExists([
                'likes as liked_by_user' => fn ($likeQuery) => $likeQuery->where('user_id', $user->id),
                'bookmarks as bookmarked_by_user' => fn ($bookmarkQuery) => $bookmarkQuery->where('user_id', $user->id),
            ]);

        $query->when($filters['search'], function ($q, $search) {
            $q->where(function ($inner) use ($search) {
                $like = "%{$search}%";
                $inner->where('title', 'like', $like)
                    ->orWhere('excerpt', 'like', $like)
                    ->orWhere('content_text', 'like', $like);
            });
        });

        $query->orderByDesc('published_at');

        return $query->paginate(10)->withQueryString()->through(function (Note $note) {
            return [
                'id' => $note->id,
                'slug' => $note->slug,
                'title' => $note->title,
                'excerpt' => $note->excerpt ?: Str::limit($note->content_text ?? '', 140),
                'ai_summary' => $note->ai_summary,
                'ai_flashcards_count' => count($note->ai_flashcards ?? []),
                'user' => [
                    'id' => $note->user->id,
                    'name' => $note->user->name,
                    'program_study' => $note->user->programStudy?->nama,
                    'university' => $note->user->university?->nama,
                    'university_short' => $note->user->university?->singkatan,
                ],
                'tags' => $note->tags->map(fn ($tag) => [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                ]),
                'liked' => (bool) $note->liked_by_user,
                'likes_count' => $note->likes_count,
                'comments_count' => $note->comments_count,
                'bookmarked' => (bool) $note->bookmarked_by_user,
                'bookmarks_count' => $note->bookmarks_count,
                'published_at' => optional($note->published_at)->toIso8601String(),
            ];
        });
    }
    private function transformNote(Note $note): array
    {
        return [
            'id' => $note->id,
            'slug' => $note->slug,
            'title' => $note->title,
            'excerpt' => $note->excerpt ?: Str::limit($note->content_text ?? '', 140),
            'ai_summary' => $note->ai_summary,
            'ai_flashcards_count' => count($note->ai_flashcards ?? []),
            'user' => [
                'id' => $note->user->id,
                'name' => $note->user->name,
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
            'bookmarked' => true,
            'bookmarks_count' => $note->bookmarks_count ?? 0,
            'published_at' => optional($note->published_at)->toIso8601String(),
            'created_at' => $note->created_at->toIso8601String(),
            'updated_at' => $note->updated_at->diffForHumans(),
        ];
    }
}
