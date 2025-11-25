<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('notes')) {
            Schema::create('notes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('university_id')->nullable()->constrained()->nullOnDelete();
                $table->foreignId('program_study_id')->nullable()->constrained()->nullOnDelete();
                $table->string('title');
                $table->string('slug')->unique();
                $table->string('status')->default('draft');
                $table->string('visibility')->default('private');
                $table->text('excerpt')->nullable();
                $table->longText('content_html')->nullable();
                $table->longText('content_text')->nullable();
                $table->string('source_type')->default('manual');
                $table->string('file_path')->nullable();
                $table->string('file_original_name')->nullable();
                $table->json('source_metadata')->nullable();
                $table->text('ai_summary')->nullable();
                $table->json('ai_flashcards')->nullable();
                $table->string('ai_status')->nullable();
                $table->timestamp('ai_requested_at')->nullable();
                $table->timestamp('ai_completed_at')->nullable();
                $table->string('notion_page_url')->nullable();
                $table->string('sync_status')->nullable();
                $table->timestamp('synced_at')->nullable();
                $table->timestamp('published_at')->nullable();
                $table->foreignId('forked_from_id')->nullable()->constrained('notes')->nullOnDelete();
                $table->timestamps();

                $table->index(['user_id', 'status']);
                $table->index(['program_study_id', 'status']);
                $table->index(['status', 'visibility', 'published_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
