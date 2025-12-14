<?php

namespace Database\Factories;

use App\Models\ProgramStudy;
use App\Models\University;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $university = University::query()->inRandomOrder()->first() ?? University::factory()->create();

        $programStudy = ProgramStudy::query()
            ->where('university_id', $university->id)
            ->inRandomOrder()
            ->first() ?? ProgramStudy::factory()->for($university)->create();

        $emailDomain = $programStudy->university->domain ?? 'example.ac.id';

        $profileCompleted = fake()->boolean(50);

        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->userName() . '@' . $emailDomain,
            'email_verified_at' => now(),
            'password' => static::$password ??= 'password',
            'remember_token' => Str::random(10),
            'two_factor_secret' => Str::random(10),
            'two_factor_recovery_codes' => Str::random(10),
            'two_factor_confirmed_at' => now(),
            'university_id' => $programStudy->university_id,
            'program_study_id' => $programStudy->id,
            'cohort_year' => (string) fake()->numberBetween(2019, 2025),
            'student_number' => fake()->numerify('24#######'),
            'profile_completed' => $profileCompleted,
            'profile_completed_at' => $profileCompleted ? now() : null,
            'profile_meta' => [],
        ];
    }

    /**
     * Mark the model's profile as completed.
     */
    public function completedProfile(): static
    {
        return $this->state(fn (array $attributes) => [
            'profile_completed' => true,
            'profile_completed_at' => now(),
        ]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the model does not have two-factor authentication configured.
     */
    public function withoutTwoFactor(): static
    {
        return $this->state(fn (array $attributes) => [
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ]);
    }
}
