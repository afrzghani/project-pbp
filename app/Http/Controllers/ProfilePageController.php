<?php

namespace App\Http\Controllers;

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
        // Load stats and notes
        $user->loadCount(['notes' => function ($query) {
            $query->visiblePublic();
        }]);

        $recentNotes = $user->notes()
            ->with(['user', 'tags']) // Eager load user and tags
            ->visiblePublic()
            ->latest()
            ->take(5)
            ->get();

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
        ]);
    }
}
