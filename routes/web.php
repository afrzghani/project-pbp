<?php

use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ImageUploadController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\NoteCommentController;
use App\Http\Controllers\NoteBookmarkController;
use App\Http\Controllers\NoteLikeController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfilePageController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('search-results', function (\Illuminate\Http\Request $request) {
    return Inertia::render('search-hasil', [
        'q' => $request->query('q', ''),
    ]);
})->name('search.results');

Route::middleware(['auth', 'verified', 'profile.complete'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('explore', [DashboardController::class, 'explore'])->name('explore');
    Route::get('bookmarks', [BookmarkController::class, 'index'])->name('bookmarks.index');
    Route::get('leaderboard', [LeaderboardController::class, 'index'])->name('leaderboard.index');
    Route::get('u/me', [ProfilePageController::class, 'me'])->name('profile.me');
    Route::get('u/{user}', [ProfilePageController::class, 'show'])->name('profile.show');

    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('api/notifications', [NotificationController::class, 'getNotifications'])->name('notifications.get');
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::delete('notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    Route::post('notes/{note}/like', [NoteLikeController::class, 'store'])->name('notes.like');
    Route::delete('notes/{note}/like', [NoteLikeController::class, 'destroy'])->name('notes.like.destroy');
    Route::get('notes/{note}/comments', [NoteCommentController::class, 'index'])->name('notes.comments.index');
    Route::post('notes/{note}/comments', [NoteCommentController::class, 'store'])->name('notes.comments.store');
    Route::delete('notes/{note}/comments/{comment}', [NoteCommentController::class, 'destroy'])->name('notes.comments.destroy');
    Route::post('notes/{note}/bookmark', [NoteBookmarkController::class, 'store'])->name('notes.bookmark');
    Route::delete('notes/{note}/bookmark', [NoteBookmarkController::class, 'destroy'])->name('notes.bookmark.destroy');
    Route::post('upload/image', [ImageUploadController::class, 'upload'])->name('upload.image');
    Route::delete('attachments/{attachment}', [\App\Http\Controllers\NoteAttachmentController::class, 'destroy'])->name('attachments.destroy');
    Route::get('read/{note}', [NoteController::class, 'read'])->name('notes.read');
    Route::resource('notes', NoteController::class);

    // Badge routes
    Route::get('badges', [\App\Http\Controllers\BadgeController::class, 'index'])->name('badges.index');
    Route::get('api/users/{user}/badges', [\App\Http\Controllers\BadgeController::class, 'userBadges'])->name('users.badges');
    Route::post('api/badges/check', [\App\Http\Controllers\BadgeController::class, 'check'])->name('badges.check');

    // AI Chat routes
    Route::post('api/notes/{note}/chat', [\App\Http\Controllers\AiChatController::class, 'chat'])->name('notes.chat');

    // Search Results Page
    Route::get('search-results', [\App\Http\Controllers\SearchController::class, 'results'])->name('search.results');
});

require __DIR__.'/settings.php';
