<?php

namespace App\Services;

use App\Models\Badge;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class BadgeService
{
    /**
     * Check and award all applicable badges for a user
     *
     * @param User $user
     * @param string|null $context Optional context to optimize which badges to check
     * @return array Array of newly awarded badges
     */
    public function checkAndAward(User $user, ?string $context = null): array
    {
        $newBadges = [];


        switch ($context) {
            case 'note_created':
                $newBadges = array_merge($newBadges, $this->checkContentCreatorBadges($user));
                break;
            case 'like_received':
                $newBadges = array_merge($newBadges, $this->checkEngagementBadges($user));
                break;
            case 'bookmark_received':
                $newBadges = array_merge($newBadges, $this->checkBookmarkBadges($user));
                break;
            case 'comment_written':
            case 'comment_received':
                $newBadges = array_merge($newBadges, $this->checkCommunityBadges($user));
                break;
            default:

                $newBadges = array_merge($newBadges, $this->checkContentCreatorBadges($user));
                $newBadges = array_merge($newBadges, $this->checkEngagementBadges($user));
                $newBadges = array_merge($newBadges, $this->checkBookmarkBadges($user));
                $newBadges = array_merge($newBadges, $this->checkCommunityBadges($user));
                $newBadges = array_merge($newBadges, $this->checkLeaderboardBadges($user));
                $newBadges = array_merge($newBadges, $this->checkStreakBadges($user));
                $newBadges = array_merge($newBadges, $this->checkUniversityBadges($user));
                $newBadges = array_merge($newBadges, $this->checkSpecialBadges($user));
                break;
        }

        return $newBadges;
    }

    /**
     * Check Content Creator badges (notes_created)
     */
    public function checkContentCreatorBadges(User $user): array
    {
        $notesCount = $user->notes()->where('status', 'published')->count();
        
        return $this->checkBadgesByType($user, 'notes_created', $notesCount);
    }

    /**
     * Check Engagement badges (likes_received)
     */
    public function checkEngagementBadges(User $user): array
    {
        $newBadges = [];


        $totalLikes = DB::table('note_likes')
            ->join('notes', 'notes.id', '=', 'note_likes.note_id')
            ->where('notes.user_id', $user->id)
            ->where('note_likes.user_id', '!=', $user->id)
            ->count();

        $newBadges = array_merge($newBadges, $this->checkBadgesByType($user, 'likes_received', $totalLikes));


        $maxLikesOnSingleNote = DB::table('note_likes')
            ->join('notes', 'notes.id', '=', 'note_likes.note_id')
            ->where('notes.user_id', $user->id)
            ->where('note_likes.user_id', '!=', $user->id)
            ->groupBy('note_likes.note_id')
            ->selectRaw('COUNT(*) as likes_count')
            ->orderBy('likes_count', 'desc')
            ->value('likes_count') ?? 0;

        $newBadges = array_merge($newBadges, $this->checkBadgesByType($user, 'single_note_likes', $maxLikesOnSingleNote));

        return $newBadges;
    }

    /**
     * Check Bookmark badges (bookmarks_received)
     */
    public function checkBookmarkBadges(User $user): array
    {
        $totalBookmarks = DB::table('note_bookmarks')
            ->join('notes', 'notes.id', '=', 'note_bookmarks.note_id')
            ->where('notes.user_id', $user->id)
            ->where('note_bookmarks.user_id', '!=', $user->id)
            ->count();

        return $this->checkBadgesByType($user, 'bookmarks_received', $totalBookmarks);
    }

    /**
     * Check Community badges (comments)
     */
    public function checkCommunityBadges(User $user): array
    {
        $newBadges = [];


        $commentsWritten = $user->noteComments()->count();
        $newBadges = array_merge($newBadges, $this->checkBadgesByType($user, 'comments_written', $commentsWritten));


        $commentsReceived = DB::table('note_comments')
            ->join('notes', 'notes.id', '=', 'note_comments.note_id')
            ->where('notes.user_id', $user->id)
            ->where('note_comments.user_id', '!=', $user->id)
            ->count();
        $newBadges = array_merge($newBadges, $this->checkBadgesByType($user, 'comments_received', $commentsReceived));

        return $newBadges;
    }

    /**
     * Check Leaderboard badges
     */
    public function checkLeaderboardBadges(User $user): array
    {

        $rank = $this->getUserGlobalRank($user);

        if ($rank === null || $rank > 50) {
            return [];
        }


        $badges = Badge::where('requirement_type', 'leaderboard_rank')
            ->where('requirement_value', '>=', $rank)
            ->get();

        $newBadges = [];
        foreach ($badges as $badge) {
            $awarded = $this->awardBadge($user, $badge);
            if ($awarded) {
                $newBadges[] = $awarded;
            }
        }

        return $newBadges;
    }

    /**
     * Check Streak badges
     */
    public function checkStreakBadges(User $user): array
    {

        $streak = $this->calculateUserStreak($user);
        
        return $this->checkBadgesByType($user, 'streak_days', $streak);
    }

    /**
     * Check University/Program Study badges
     */
    public function checkUniversityBadges(User $user): array
    {
        $newBadges = [];

        if ($user->university_id) {
            $universityRank = $this->getUserUniversityRank($user);
            if ($universityRank && $universityRank <= 10) {
                $badges = Badge::where('requirement_type', 'university_rank')
                    ->where('requirement_value', '>=', $universityRank)
                    ->get();
                
                foreach ($badges as $badge) {
                    $awarded = $this->awardBadge($user, $badge);
                    if ($awarded) {
                        $newBadges[] = $awarded;
                    }
                }
            }
        }

        if ($user->program_study_id) {
            $programRank = $this->getUserProgramStudyRank($user);
            if ($programRank && $programRank <= 5) {
                $badges = Badge::where('requirement_type', 'program_study_rank')
                    ->where('requirement_value', '>=', $programRank)
                    ->get();
                
                foreach ($badges as $badge) {
                    $awarded = $this->awardBadge($user, $badge);
                    if ($awarded) {
                        $newBadges[] = $awarded;
                    }
                }
            }
        }

        return $newBadges;
    }

    /**
     * Check Special badges
     */
    public function checkSpecialBadges(User $user): array
    {
        $newBadges = [];

        $launchDate = now()->subMonth();
        if ($user->created_at && $user->created_at->lte($launchDate)) {
            $badge = Badge::where('slug', 'early-adopter')->first();
            if ($badge) {
                $awarded = $this->awardBadge($user, $badge);
                if ($awarded) {
                    $newBadges[] = $awarded;
                }
            }
        }


        $totalEngagement = DB::table('note_likes')
            ->join('notes', 'notes.id', '=', 'note_likes.note_id')
            ->where('notes.user_id', $user->id)
            ->where('note_likes.user_id', '!=', $user->id)
            ->count();

        $totalEngagement += DB::table('note_bookmarks')
            ->join('notes', 'notes.id', '=', 'note_bookmarks.note_id')
            ->where('notes.user_id', $user->id)
            ->where('note_bookmarks.user_id', '!=', $user->id)
            ->count();

        $newBadges = array_merge($newBadges, $this->checkBadgesByType($user, 'total_engagement', $totalEngagement));

        return $newBadges;
    }

    /**
     * Check badges by type and value
     */
    private function checkBadgesByType(User $user, string $type, int $value): array
    {
        $badges = Badge::where('requirement_type', $type)
            ->where('requirement_value', '<=', $value)
            ->get();

        $newBadges = [];
        foreach ($badges as $badge) {
            $awarded = $this->awardBadge($user, $badge);
            if ($awarded) {
                $newBadges[] = $awarded;
            }
        }

        return $newBadges;
    }

    /**
     * Award a badge to user if not already owned
     */
    private function awardBadge(User $user, Badge $badge): ?Badge
    {

        if ($user->badges()->where('badge_id', $badge->id)->exists()) {
            return null;
        }


        $user->badges()->attach($badge->id, [
            'awarded_at' => now(),
        ]);


        Notification::createForBadge($user->id, $badge->id);

        return $badge;
    }

    /**
     * Get user's global leaderboard rank
     */
    private function getUserGlobalRank(User $user): ?int
    {
        $pointsQuery = '
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
            ), 0) * 2)
        ';

        $rankedUsers = DB::table('users')
            ->selectRaw("users.id, {$pointsQuery} as points")
            ->orderByRaw("{$pointsQuery} DESC")
            ->get();

        $rank = 1;
        foreach ($rankedUsers as $rankedUser) {
            if ($rankedUser->id === $user->id) {
                return $rank;
            }
            $rank++;
        }

        return null;
    }

    /**
     * Get user's university rank
     */
    private function getUserUniversityRank(User $user): ?int
    {
        if (!$user->university_id) {
            return null;
        }

        $pointsQuery = '
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
            ), 0) * 2)
        ';

        $rankedUsers = DB::table('users')
            ->where('university_id', $user->university_id)
            ->selectRaw("users.id, {$pointsQuery} as points")
            ->orderByRaw("{$pointsQuery} DESC")
            ->get();

        $rank = 1;
        foreach ($rankedUsers as $rankedUser) {
            if ($rankedUser->id === $user->id) {
                return $rank;
            }
            $rank++;
        }

        return null;
    }

    /**
     * Get user's program study rank
     */
    private function getUserProgramStudyRank(User $user): ?int
    {
        if (!$user->program_study_id) {
            return null;
        }

        $pointsQuery = '
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
            ), 0) * 2)
        ';

        $rankedUsers = DB::table('users')
            ->where('program_study_id', $user->program_study_id)
            ->selectRaw("users.id, {$pointsQuery} as points")
            ->orderByRaw("{$pointsQuery} DESC")
            ->get();

        $rank = 1;
        foreach ($rankedUsers as $rankedUser) {
            if ($rankedUser->id === $user->id) {
                return $rank;
            }
            $rank++;
        }

        return null;
    }

    /**
     * Calculate user's current streak
     */
    private function calculateUserStreak(User $user): int
    {

        $activityDates = DB::table('activity_logs')
            ->where('user_id', $user->id)
            ->selectRaw('CAST(created_at AS DATE) as activity_date')
            ->groupBy(DB::raw('CAST(created_at AS DATE)'))
            ->orderBy('activity_date', 'desc')
            ->pluck('activity_date')
            ->map(fn ($date) => is_object($date) ? $date->format('Y-m-d') : $date)
            ->toArray();

        if (empty($activityDates)) {
            return 0;
        }

        $streak = 0;
        $today = now()->format('Y-m-d');
        $yesterday = now()->subDay()->format('Y-m-d');


        if (!in_array($today, $activityDates) && !in_array($yesterday, $activityDates)) {
            return 0;
        }


        $currentDate = in_array($today, $activityDates) ? now() : now()->subDay();
        
        foreach ($activityDates as $date) {
            if ($date === $currentDate->format('Y-m-d')) {
                $streak++;
                $currentDate = $currentDate->subDay();
            } else {
                break;
            }
        }

        return $streak;
    }
}
