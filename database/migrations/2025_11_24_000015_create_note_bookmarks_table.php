<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('note_bookmarks')) {
            Schema::create('note_bookmarks', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('note_id')->constrained()->cascadeOnDelete();
                $table->timestamps();

                $table->unique(['user_id', 'note_id']);
                $table->index('user_id');
                $table->index('note_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('note_bookmarks');
    }
};
