<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Note extends Model
{
    use HasFactory;

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    protected $fillable = [
        'user_id',
        'forked_from_id',
        'university_id',
        'program_study_id',
        'title',
        'slug',
        'status',
        'visibility',
        'excerpt',
        'content_html',
        'content_text',
        'source_type',
        'file_path',
        'file_original_name',
        'source_metadata',
        'ai_summary',
        'ai_flashcards',
        'ai_status',
        'ai_requested_at',
        'ai_completed_at',

        'sync_status',
        'synced_at',
        'published_at',
    ];

    protected $casts = [
        'source_metadata' => 'array',
        'ai_flashcards' => 'array',
        'ai_requested_at' => 'datetime',
        'ai_completed_at' => 'datetime',
        'synced_at' => 'datetime',
        'published_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class);
    }

    public function programStudy(): BelongsTo
    {
        return $this->belongsTo(ProgramStudy::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(NoteComment::class);
    }

    public function bookmarks(): HasMany
    {
        return $this->hasMany(NoteBookmark::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(NoteTag::class)->withTimestamps();
    }

    public function likes(): HasMany
    {
        return $this->hasMany(NoteLike::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(NoteAttachment::class);
    }

    public function views(): HasMany
    {
        return $this->hasMany(NoteView::class);
    }

    public function scopeVisiblePublic($query)
    {
        return $query->where('status', 'published')
            ->where('visibility', 'public');
    }

    public function isPublic(): bool
    {
        return $this->status === 'published' && $this->visibility === 'public';
    }

    public function isInteractableBy(User $user): bool
    {
        return $this->isPublic() || $this->user_id === $user->id;
    }
}
