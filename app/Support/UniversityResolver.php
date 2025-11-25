<?php

namespace App\Support;

use App\Models\University;
use Illuminate\Support\Str;

class UniversityResolver
{
    /**
     * Resolve a university from the email domain.
     */
    public static function fromEmail(string $email): ?University
    {
        $domain = Str::lower(Str::after($email, '@'));

        if (! $domain) {
            return null;
        }

        return static::fromDomain($domain);
    }

    /**
     * Resolve a university from a domain string.
     */
    public static function fromDomain(string $domain): ?University
    {
        $normalizedDomain = Str::lower($domain);

        return University::query()
            ->where('domain', $normalizedDomain)
            ->orWhere(function ($query) use ($normalizedDomain) {
                $query->whereNotNull('domain_aliases')
                    ->whereJsonContains('domain_aliases', $normalizedDomain);
            })
            ->first();
    }
}



