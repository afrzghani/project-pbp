<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaderboardController extends Controller
{
    public function index(Request $request): Response
    {
        // Simple leaderboard: Users with most published public notes
        $users = User::withCount(['notes' => function ($query) {
                $query->visiblePublic();
            }])
            ->orderByDesc('notes_count')
            ->take(50)
            ->get();

        return Inertia::render('leaderboard', [
            'users' => $users,
        ]);
    }
}
