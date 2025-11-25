<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('note_note_tag')) {
            Schema::create('note_note_tag', function (Blueprint $table) {
                $table->id();
                $table->foreignId('note_id')->constrained()->cascadeOnDelete();
                $table->foreignId('note_tag_id')->constrained()->cascadeOnDelete();
                $table->timestamps();

                $table->unique(['note_id', 'note_tag_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('note_note_tag');
    }
};
