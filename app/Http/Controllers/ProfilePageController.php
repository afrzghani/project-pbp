<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfilePageController extends Controller
{
    public function me(Request $request): Response
    {
        return $this->show($request, $request->user());
    }

    public function show(Request $request, User $user): Response
    {
        $user->loadCount(['notes' => function ($query) {
            $query->visiblePublic();
        }]);

        $recentNotes = $user->notes()
            ->with(['user', 'tags'])
            ->visiblePublic()
            ->latest()
            ->take(5)
            ->get();

        // Load user badges
        $badges = $user->badges()->limit(20)->get()->map(function ($badge) {
            return [
                'id' => $badge->id,
                'slug' => $badge->slug,
                'name' => $badge->name,
                'description' => $badge->description,
                'icon' => $badge->icon,
                'tier' => $badge->tier,
                'category' => $badge->category,
                'earned' => true,
                'awarded_at' => $badge->pivot->awarded_at,
            ];
        });

        return Inertia::render('profile/show', [
            'profileUser' => array_merge($user->toArray(), [
                'avatar_url' => $user->avatar_url,
                'acronym' => strtoupper(substr($user->name, 0, 2)),
            ]),
            'stats' => [
                'notes_count' => $user->notes_count,
            ],
            'recentNotes' => $recentNotes,
            'isOwnProfile' => $request->user()?->id === $user->id,
            'badges' => $badges,
            'badgeStats' => [
                'earned' => $user->badges()->count(),
                'total' => Badge::count(),
            ],
        ]);
    }
}

