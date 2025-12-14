<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NoteComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'note_id',
        'user_id',
        'parent_id',
        'body',
        'status',
    ];

    public function note(): BelongsTo
    {
        return $this->belongsTo(Note::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(NoteComment::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(NoteComment::class, 'parent_id');
    }
}

