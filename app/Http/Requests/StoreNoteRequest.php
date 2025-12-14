<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'status' => ['nullable', 'in:draft,published,archived'],
            'visibility' => ['nullable', 'in:private,public'],
            'excerpt' => ['nullable', 'string'],
            'content_html' => ['nullable', 'string'],
            'content_text' => ['nullable', 'string'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:10240'],
            'files' => ['nullable', 'array'],
            'files.*' => ['file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:10240'],
            'source_type' => ['nullable', 'in:manual,upload'],
            'process_ai' => ['nullable', 'boolean'],
        ];
    }
}
