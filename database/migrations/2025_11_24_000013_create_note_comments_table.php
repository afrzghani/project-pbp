<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('note_comments')) {
            Schema::create('note_comments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('note_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('parent_id')->nullable()->constrained('note_comments')->nullOnDelete();
                $table->text('body');
                $table->string('status')->default('published');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('note_comments');
    }
};
