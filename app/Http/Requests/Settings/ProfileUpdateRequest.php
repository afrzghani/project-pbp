<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],

            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
                'regex:/@.*\.ac\.id$/i',
            ],

            'program_study_id' => [
                'required',
                Rule::exists('program_studies', 'id')->where(fn ($q) => $q->whereRaw('aktif IS TRUE')),
            ],

            'cohort_year' => ['required', 'regex:/^(19|20)\d{2}$/'],
            'student_number' => ['nullable', 'string', 'max:50'],
            'profile_meta' => ['nullable', 'array'],
        ];
    }
}
