<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'university_id',
        'program_study_id',
        'cohort_year',
        'student_number',
        'profile_completed',
        'profile_completed_at',
        'profile_meta',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'profile_completed_at' => 'datetime',
            'profile_completed' => 'boolean',
            'profile_meta' => 'array',
        ];
    }

    /**
     * @return BelongsTo<University, $this>
     */
    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class);
    }

    /**
     * @return BelongsTo<ProgramStudy, $this>
     */
    public function programStudy(): BelongsTo
    {
        return $this->belongsTo(ProgramStudy::class);
    }

    /**
     * @return HasMany<ActivityLog>
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * @return HasMany<Note>
     */
    public function notes(): HasMany
    {
        return $this->hasMany(Note::class);
    }

    /**
     * @return HasMany<NoteLike>
     */
    public function noteLikes(): HasMany
    {
        return $this->hasMany(NoteLike::class);
    }

    /**
     * @return HasMany<NoteComment>
     */
    public function noteComments(): HasMany
    {
        return $this->hasMany(NoteComment::class);
    }



    /**
     * @return HasMany<NoteBookmark>
     */
    public function bookmarks(): HasMany
    {
        return $this->hasMany(NoteBookmark::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany<Badge>
     */
    public function badges(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Badge::class, 'user_badges')
            ->withPivot('awarded_at')
            ->orderByPivot('awarded_at', 'desc');
    }

    /**
     * Get the avatar URL.
     */
    public function getAvatarUrlAttribute(): ?string
    {
        if (!$this->avatar) {
            return null;
        }

        return \Illuminate\Support\Facades\Storage::disk(config('filesystems.default'))->url($this->avatar);
    }
}

