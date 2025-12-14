<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class NoteAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'note_id',
        'file_path',
        'file_name',
        'file_type',
        'mime_type',
        'size',
    ];

    protected $appends = ['url'];

    public function note(): BelongsTo
    {
        return $this->belongsTo(Note::class);
    }

    public function getUrlAttribute(): string
    {
        return Storage::url($this->file_path);
    }
}
