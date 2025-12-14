<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\ProgramStudy;
use App\Models\University;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'academicOptions' => [
                'universities' => University::query()
                    ->select(['id', 'nama', 'slug', 'singkatan'])
                    ->whereRaw('aktif IS TRUE')
                    ->orderBy('nama')
                    ->get(),
                'programStudies' => ProgramStudy::query()
                    ->select(['id', 'university_id', 'nama', 'slug', 'jenjang'])
                    ->whereRaw('aktif IS TRUE')
                    ->orderBy('nama')
                    ->get(),
            ],
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $programStudy = ProgramStudy::findOrFail($data['program_study_id']);
        $data['university_id'] = $programStudy->university_id;

        $user = $request->user();

        if ($user->email !== $data['email']) {
            $user->email_verified_at = null;
        }

        $shouldMarkCompleted = filled($data['program_study_id']) && filled($data['cohort_year']);

        if ($shouldMarkCompleted && ! $user->profile_completed) {
            $data['profile_completed'] = 'true';
            $data['profile_completed_at'] = now();
        }

        $user->fill($data);
        $user->save();

        return to_route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Update the user's avatar.
     */
    public function updateAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:2048'],
        ]);

        $user = $request->user();


        if ($user->avatar) {
            \Illuminate\Support\Facades\Storage::disk(config('filesystems.default'))->delete($user->avatar);
        }


        $path = $request->file('avatar')->store('avatars/' . $user->id, config('filesystems.default'));

        $user->update(['avatar' => $path]);

        return back()->with('status', 'avatar-updated');
    }

    /**
     * Delete the user's avatar.
     */
    public function destroyAvatar(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->avatar) {
            \Illuminate\Support\Facades\Storage::disk(config('filesystems.default'))->delete($user->avatar);
            $user->update(['avatar' => null]);
        }

        return back()->with('status', 'avatar-deleted');
    }
}
