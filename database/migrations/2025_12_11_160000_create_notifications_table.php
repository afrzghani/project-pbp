<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // penerima notifikasi
            $table->foreignId('actor_id')->constrained('users')->onDelete('cascade'); // orang yang melakukan aksi
            $table->string('type'); // like, comment, bookmark
            $table->foreignId('note_id')->constrained()->onDelete('cascade');
            $table->foreignId('comment_id')->nullable()->constrained('note_comments')->onDelete('cascade');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            // Index untuk query yang sering
            $table->index(['user_id', 'read_at']);
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
