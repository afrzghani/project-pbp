<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'actor_id',
        'type',
        'note_id',
        'comment_id',
        'badge_id',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];


    const TYPE_LIKE = 'like';
    const TYPE_COMMENT = 'comment';
    const TYPE_BOOKMARK = 'bookmark';
    const TYPE_BADGE = 'badge';

    /**
     * User yang menerima notifikasi
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * User yang melakukan aksi
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /**
     * Note yang terkait
     */
    public function note(): BelongsTo
    {
        return $this->belongsTo(Note::class);
    }

    /**
     * Comment yang terkait (untuk notifikasi comment)
     */
    public function comment(): BelongsTo
    {
        return $this->belongsTo(NoteComment::class, 'comment_id');
    }

    /**
     * Badge yang terkait (untuk notifikasi badge)
     */
    public function badge(): BelongsTo
    {
        return $this->belongsTo(Badge::class);
    }

    /**
     * Scope untuk notifikasi yang belum dibaca
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    /**
     * Tandai notifikasi sebagai sudah dibaca
     */
    public function markAsRead(): void
    {
        if (is_null($this->read_at)) {
            $this->update(['read_at' => now()]);
        }
    }

    /**
     * Buat notifikasi untuk like
     */
    public static function createForLike(int $userId, int $actorId, int $noteId): ?self
    {

        if ($userId === $actorId) {
            return null;
        }

        return self::create([
            'user_id' => $userId,
            'actor_id' => $actorId,
            'type' => self::TYPE_LIKE,
            'note_id' => $noteId,
        ]);
    }

    /**
     * Buat notifikasi untuk comment
     */
    public static function createForComment(int $userId, int $actorId, int $noteId, int $commentId): ?self
    {

        if ($userId === $actorId) {
            return null;
        }

        return self::create([
            'user_id' => $userId,
            'actor_id' => $actorId,
            'type' => self::TYPE_COMMENT,
            'note_id' => $noteId,
            'comment_id' => $commentId,
        ]);
    }

    /**
     * Buat notifikasi untuk bookmark
     */
    public static function createForBookmark(int $userId, int $actorId, int $noteId): ?self
    {

        if ($userId === $actorId) {
            return null;
        }

        return self::create([
            'user_id' => $userId,
            'actor_id' => $actorId,
            'type' => self::TYPE_BOOKMARK,
            'note_id' => $noteId,
        ]);
    }

    /**
     * Buat notifikasi untuk badge earned
     */
    public static function createForBadge(int $userId, int $badgeId): self
    {
        return self::create([
            'user_id' => $userId,
            'type' => self::TYPE_BADGE,
            'badge_id' => $badgeId,
        ]);
    }
}
