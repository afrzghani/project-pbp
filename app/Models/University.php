<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class University extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'nama',
        'slug',
        'domain',
        'domain_aliases',
        'singkatan',
        'kota',
        'aktif',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'domain_aliases' => 'array',
        'aktif' => 'boolean',
    ];

    /**
     * @return HasMany<ProgramStudy, $this>
     */
    public function programStudies(): HasMany
    {
        return $this->hasMany(ProgramStudy::class);
    }

    /**
     * @return HasMany<User, $this>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
