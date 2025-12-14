<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProfileIsComplete
{
    /**
     * Redirect users to the profile page when their academic profile is incomplete.
     *
     * @param  Closure(Request):Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->profile_completed) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Lengkapi profil akademik sebelum melanjutkan.',
                ], Response::HTTP_CONFLICT);
            }

            return redirect()
                ->route('profile.edit')
                ->with('flash.banner', 'Lengkapi profil akademik Anda terlebih dahulu.')
                ->with('flash.bannerStyle', 'warning');
        }

        return $next($request);
    }
}

