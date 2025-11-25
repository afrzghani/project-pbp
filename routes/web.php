<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FlashcardController;
use App\Http\Controllers\ImageUploadController;
use App\Http\Controllers\NotionOAuthController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\NoteCommentController;
use App\Http\Controllers\NoteBookmarkController;
use App\Http\Controllers\NoteLikeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('notion/connect', [NotionOAuthController::class, 'redirect'])->name('notion.connect');
    Route::get('notion/callback', [NotionOAuthController::class, 'callback'])->name('notion.callback');
    Route::delete('notion/disconnect', [NotionOAuthController::class, 'disconnect'])->name('notion.disconnect');
});

Route::middleware(['auth', 'verified', 'profile.complete'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('flashcards', [FlashcardController::class, 'index'])->name('flashcards.index');
    Route::post('notes/{note}/like', [NoteLikeController::class, 'store'])->name('notes.like');
    Route::delete('notes/{note}/like', [NoteLikeController::class, 'destroy'])->name('notes.like.destroy');
    Route::get('notes/{note}/comments', [NoteCommentController::class, 'index'])->name('notes.comments.index');
    Route::post('notes/{note}/comments', [NoteCommentController::class, 'store'])->name('notes.comments.store');
    Route::delete('notes/{note}/comments/{comment}', [NoteCommentController::class, 'destroy'])->name('notes.comments.destroy');
    Route::post('notes/{note}/bookmark', [NoteBookmarkController::class, 'store'])->name('notes.bookmark');
    Route::delete('notes/{note}/bookmark', [NoteBookmarkController::class, 'destroy'])->name('notes.bookmark.destroy');
    Route::post('upload/image', [ImageUploadController::class, 'upload'])->name('upload.image');
    Route::delete('attachments/{attachment}', [\App\Http\Controllers\NoteAttachmentController::class, 'destroy'])->name('attachments.destroy');
    Route::resource('notes', NoteController::class);
});

require __DIR__.'/settings.php';
