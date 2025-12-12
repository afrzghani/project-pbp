<?php

namespace App\Console\Commands;

use App\Models\Badge;
use App\Models\User;
use App\Services\BadgeService;
use Illuminate\Console\Command;

class BadgeDebugCommand extends Command
{
    protected $signature = 'badge:debug {userId?} {--check : Run badge check} {--award= : Award specific badge by slug} {--list : List all badges} {--user-badges : List user badges}';

    protected $description = 'Debug and test badge system';

    public function handle(BadgeService $badgeService): int
    {
        // List all badges
        if ($this->option('list')) {
            $badges = Badge::all();
            $this->table(
                ['ID', 'Slug', 'Name', 'Tier', 'Type', 'Value'],
                $badges->map(fn ($b) => [$b->id, $b->slug, $b->name, $b->tier, $b->requirement_type, $b->requirement_value])
            );
            return 0;
        }

        // Get user
        $userId = $this->argument('userId') ?? User::first()?->id;
        $user = User::find($userId);

        if (!$user) {
            $this->error("User dengan ID {$userId} tidak ditemukan!");
            return 1;
        }

        $this->info("User: {$user->name} (ID: {$user->id})");
        $this->newLine();

        // List user badges
        if ($this->option('user-badges')) {
            $userBadges = $user->badges;
            if ($userBadges->isEmpty()) {
                $this->warn('User belum memiliki badge.');
            } else {
                $this->table(
                    ['ID', 'Slug', 'Name', 'Tier', 'Awarded At'],
                    $userBadges->map(fn ($b) => [$b->id, $b->slug, $b->name, $b->tier, $b->pivot->awarded_at])
                );
            }
            return 0;
        }

        // Manual award badge
        if ($slug = $this->option('award')) {
            $badge = Badge::where('slug', $slug)->first();
            if (!$badge) {
                $this->error("Badge dengan slug '{$slug}' tidak ditemukan!");
                return 1;
            }

            if ($user->badges()->where('badge_id', $badge->id)->exists()) {
                $this->warn("User sudah memiliki badge '{$badge->name}'.");
                return 0;
            }

            $user->badges()->attach($badge->id, ['awarded_at' => now()]);
            \App\Models\Notification::createForBadge($user->id, $badge->id);
            
            $this->info("✅ Badge '{$badge->name}' berhasil diberikan ke {$user->name}!");
            return 0;
        }

        // Run badge check
        if ($this->option('check')) {
            $this->info('Menjalankan badge check...');
            $this->newLine();

            // Show current stats
            $this->info('📊 User Stats:');
            $this->line("- Published Notes: " . $user->notes()->where('status', 'published')->count());
            $this->line("- Total Likes Received: " . \DB::table('note_likes')
                ->join('notes', 'notes.id', '=', 'note_likes.note_id')
                ->where('notes.user_id', $user->id)
                ->count());
            $this->line("- Total Bookmarks Received: " . \DB::table('note_bookmarks')
                ->join('notes', 'notes.id', '=', 'note_bookmarks.note_id')
                ->where('notes.user_id', $user->id)
                ->count());
            $this->line("- Comments Written: " . $user->noteComments()->count());
            $this->newLine();

            $newBadges = $badgeService->checkAndAward($user);

            if (empty($newBadges)) {
                $this->warn('Tidak ada badge baru yang diperoleh.');
            } else {
                $this->info('🎉 Badge baru diperoleh:');
                foreach ($newBadges as $badge) {
                    $this->line("  - {$badge->name} ({$badge->slug})");
                }
            }
            return 0;
        }

        // Default: show help
        $this->line('Usage:');
        $this->line('  php artisan badge:debug --list              # List all badges');
        $this->line('  php artisan badge:debug {userId}            # Debug specific user');
        $this->line('  php artisan badge:debug --user-badges       # List user badges');
        $this->line('  php artisan badge:debug --check             # Run badge check');
        $this->line('  php artisan badge:debug --award=anak-baru   # Award specific badge');
        
        return 0;
    }
}
