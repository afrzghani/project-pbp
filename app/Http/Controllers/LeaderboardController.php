<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LeaderboardController extends Controller
{
    private function getAvatarUrl(?string $avatar): ?string
    {
        if (!$avatar) {
            return null;
        }
        return Storage::disk(config('filesystems.default'))->url($avatar);
    }
    public function index(Request $request): Response
    {
        $type = $request->input('type', 'global');
        $currentUser = Auth::user();

        $globalUsers = $this->getGlobalLeaderboard();
        

        $universityUsers = $currentUser?->university_id 
            ? $this->getUniversityUsersLeaderboard($currentUser->university_id)
            : collect([]);
            

        $programStudyUsers = $currentUser?->program_study_id 
            ? $this->getProgramStudyLeaderboard($currentUser->program_study_id)
            : collect([]);

        return Inertia::render('leaderboard', [
            'globalUsers' => $globalUsers,
            'universityUsers' => $universityUsers,
            'programStudyUsers' => $programStudyUsers,
            'currentUniversity' => $currentUser?->university?->nama ?? null,
            'currentProgramStudy' => $currentUser?->programStudy?->nama ?? null,
            'activeTab' => $type,
        ]);
    }

    private function getPointsQuery(): string
    {
        return '
            (COALESCE((
                SELECT COUNT(*) 
                FROM note_likes 
                INNER JOIN notes ON notes.id = note_likes.note_id 
                WHERE notes.user_id = users.id 
                AND notes.visibility = \'public\' 
                AND notes.status = \'published\'
                AND note_likes.user_id != users.id
            ), 0) * 1 +
            COALESCE((
                SELECT COUNT(*) 
                FROM note_bookmarks 
                INNER JOIN notes ON notes.id = note_bookmarks.note_id 
                WHERE notes.user_id = users.id 
                AND notes.visibility = \'public\' 
                AND notes.status = \'published\'
                AND note_bookmarks.user_id != users.id
            ), 0) * 2)::integer
        ';
    }

    private function getGlobalLeaderboard()
    {
        $users = DB::table('users')
            ->select('users.id', 'users.name', 'users.avatar', 'users.university_id', 'users.program_study_id')
            ->selectRaw('
                COALESCE((
                    SELECT COUNT(*) 
                    FROM note_likes 
                    INNER JOIN notes ON notes.id = note_likes.note_id 
                    WHERE notes.user_id = users.id 
                    AND notes.visibility = \'public\' 
                    AND notes.status = \'published\'
                    AND note_likes.user_id != users.id
                ), 0)::integer as likes_received
            ')
            ->selectRaw('
                COALESCE((
                    SELECT COUNT(*) 
                    FROM note_bookmarks 
                    INNER JOIN notes ON notes.id = note_bookmarks.note_id 
                    WHERE notes.user_id = users.id 
                    AND notes.visibility = \'public\' 
                    AND notes.status = \'published\'
                    AND note_bookmarks.user_id != users.id
                ), 0)::integer as bookmarks_received
            ')
            ->selectRaw($this->getPointsQuery() . ' as total_points')
            ->leftJoin('universities', 'users.university_id', '=', 'universities.id')
            ->leftJoin('program_studies', 'users.program_study_id', '=', 'program_studies.id')
            ->addSelect('universities.nama as university_name')
            ->addSelect('program_studies.nama as program_study_name')
            ->orderByDesc('total_points')
            ->limit(50)
            ->get();

        return $users->map(fn ($user) => $this->transformUser($user));
    }

    private function getUniversityUsersLeaderboard(int $universityId)
    {
        $users = DB::table('users')
            ->select('users.id', 'users.name', 'users.avatar', 'users.program_study_id')
            ->selectRaw('
                COALESCE((
                    SELECT COUNT(*) 
                    FROM note_likes 
                    INNER JOIN notes ON notes.id = note_likes.note_id 
                    WHERE notes.user_id = users.id 
                    AND notes.visibility = \'public\' 
                    AND notes.status = \'published\'
                    AND note_likes.user_id != users.id
                ), 0)::integer as likes_received
            ')
            ->selectRaw('
                COALESCE((
                    SELECT COUNT(*) 
                    FROM note_bookmarks 
                    INNER JOIN notes ON notes.id = note_bookmarks.note_id 
                    WHERE notes.user_id = users.id 
                    AND notes.visibility = \'public\' 
                    AND notes.status = \'published\'
                    AND note_bookmarks.user_id != users.id
                ), 0)::integer as bookmarks_received
            ')
            ->selectRaw($this->getPointsQuery() . ' as total_points')
            ->leftJoin('program_studies', 'users.program_study_id', '=', 'program_studies.id')
            ->addSelect('program_studies.nama as program_study_name')
            ->where('users.university_id', $universityId)
            ->orderByDesc('total_points')
            ->limit(50)
            ->get();

        return $users->map(fn ($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'avatar_url' => $this->getAvatarUrl($user->avatar),
            'acronym' => strtoupper(substr($user->name, 0, 2)),
            'program_study' => $user->program_study_name,
            'likes_received' => $user->likes_received,
            'bookmarks_received' => $user->bookmarks_received,
            'total_points' => $user->total_points,
        ]);
    }

    private function getProgramStudyLeaderboard(int $programStudyId)
    {
        $users = DB::table('users')
            ->select('users.id', 'users.name', 'users.avatar')
            ->selectRaw('
                COALESCE((
                    SELECT COUNT(*) 
                    FROM note_likes 
                    INNER JOIN notes ON notes.id = note_likes.note_id 
                    WHERE notes.user_id = users.id 
                    AND notes.visibility = \'public\' 
                    AND notes.status = \'published\'
                    AND note_likes.user_id != users.id
                ), 0)::integer as likes_received
            ')
            ->selectRaw('
                COALESCE((
                    SELECT COUNT(*) 
                    FROM note_bookmarks 
                    INNER JOIN notes ON notes.id = note_bookmarks.note_id 
                    WHERE notes.user_id = users.id 
                    AND notes.visibility = \'public\' 
                    AND notes.status = \'published\'
                    AND note_bookmarks.user_id != users.id
                ), 0)::integer as bookmarks_received
            ')
            ->selectRaw($this->getPointsQuery() . ' as total_points')
            ->where('users.program_study_id', $programStudyId)
            ->orderByDesc('total_points')
            ->limit(50)
            ->get();

        return $users->map(fn ($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'avatar_url' => $this->getAvatarUrl($user->avatar),
            'acronym' => strtoupper(substr($user->name, 0, 2)),
            'likes_received' => $user->likes_received,
            'bookmarks_received' => $user->bookmarks_received,
            'total_points' => $user->total_points,
        ]);
    }

    private function transformUser($user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'avatar_url' => $this->getAvatarUrl($user->avatar),
            'acronym' => strtoupper(substr($user->name, 0, 2)),
            'university' => $user->university_name ? ['name' => $user->university_name] : null,
            'program_study' => $user->program_study_name ?? null,
            'likes_received' => $user->likes_received,
            'bookmarks_received' => $user->bookmarks_received,
            'total_points' => $user->total_points,
        ];
    }
}
