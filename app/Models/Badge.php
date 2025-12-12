<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Badge extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'description',
        'icon',
        'category',
        'tier',
        'requirement_type',
        'requirement_value',
    ];

    protected $casts = [
        'tier' => 'integer',
        'requirement_value' => 'integer',
    ];

    /**
     * Users who have earned this badge
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_badges')
            ->withPivot('awarded_at')
            ->withTimestamps();
    }

    /**
     * Scope to filter badges by category
     */
    public function scopeCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope to filter badges by requirement type
     */
    public function scopeRequirement($query, string $type)
    {
        return $query->where('requirement_type', $type);
    }
}
