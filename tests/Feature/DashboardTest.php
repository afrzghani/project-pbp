<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs(User::factory()->completedProfile()->create());

    $this->get(route('dashboard'))->assertOk();
});

test('users with incomplete profile are redirected to profile settings', function () {
    $this->actingAs(
        User::factory()->create([
            'profile_completed' => false,
            'profile_completed_at' => null,
        ])
    );

    $this->get(route('dashboard'))->assertRedirect(route('profile.edit'));
});