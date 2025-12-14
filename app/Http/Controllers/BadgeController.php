<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use App\Models\User;
use App\Services\BadgeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BadgeController extends Controller
{
    public function __construct(
        private BadgeService $badgeService
    ) {}
    public function index(Request $request): Response
    {
        $user = $request->user();
        $allBadges = Badge::all();
        $earnedBadgeIds = $user->badges()->pluck('badges.id')->toArray();

        $categorizedBadges = $allBadges->groupBy('category')->map(function ($badges) use ($earnedBadgeIds) {
            return $badges->map(function ($badge) use ($earnedBadgeIds) {
                return [
                    'id' => $badge->id,
                    'slug' => $badge->slug,
                    'name' => $badge->name,
                    'description' => $badge->description,
                    'icon' => $badge->icon,
                    'tier' => $badge->tier,
                    'category' => $badge->category,
                    'earned' => in_array($badge->id, $earnedBadgeIds),
                ];
            });
        });

        return Inertia::render('badges/index', [
            'categorizedBadges' => $categorizedBadges,
            'stats' => [
                'earned' => count($earnedBadgeIds),
                'total' => $allBadges->count(),
            ],
        ]);
    }

    public function userBadges(User $user): JsonResponse
    {
        $badges = $user->badges()->get()->map(function ($badge) {
            return [
                'id' => $badge->id,
                'slug' => $badge->slug,
                'name' => $badge->name,
                'description' => $badge->description,
                'icon' => $badge->icon,
                'tier' => $badge->tier,
                'category' => $badge->category,
                'awarded_at' => $badge->pivot->awarded_at,
            ];
        });

        return response()->json([
            'badges' => $badges,
            'stats' => [
                'earned' => $badges->count(),
                'total' => Badge::count(),
            ],
        ]);
    }

    public function check(Request $request): JsonResponse
    {
        $newBadges = $this->badgeService->checkAndAward($request->user());

        return response()->json([
            'new_badges' => $newBadges->map(function ($badge) {
                return [
                    'id' => $badge->id,
                    'slug' => $badge->slug,
                    'name' => $badge->name,
                    'description' => $badge->description,
                    'icon' => $badge->icon,
                    'tier' => $badge->tier,
                ];
            }),
        ]);
    }
}
