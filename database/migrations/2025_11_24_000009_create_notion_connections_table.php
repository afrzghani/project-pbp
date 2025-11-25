<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('notion_connections')) {
            Schema::create('notion_connections', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
                $table->string('access_token');
                $table->string('workspace_id')->nullable();
                $table->string('workspace_name')->nullable();
                $table->string('workspace_icon')->nullable();
                $table->string('bot_id')->nullable();
                $table->string('owner_type')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('notion_connections');
    }
};
