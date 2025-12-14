<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Support\UniversityResolver;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make(
            $input,
            [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'regex:/@.*\.ac\.id$/i',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
            ],
            [
                'email.regex' => 'Email harus menggunakan domain universitas (ac.id).',
            ]
        )->after(function ($validator) use ($input) {
            $university = UniversityResolver::fromEmail($input['email'] ?? '');

            if (! $university) {
                $validator->errors()->add(
                    'email',
                    'Domain email kampus belum terdaftar. Silakan hubungi admin.'
                );
            }
        })->validate();

        $university = UniversityResolver::fromEmail($input['email']);

        if (! $university) {
            throw ValidationException::withMessages([
                'email' => 'Domain email kampus belum terdaftar. Silakan hubungi admin.',
            ]);
        }

        return User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'university_id' => $university->id,
            'profile_completed' => 'false',
            'profile_meta' => [],
        ]);
    }
}
