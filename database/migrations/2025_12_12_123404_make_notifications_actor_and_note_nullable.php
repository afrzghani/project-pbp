<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {

        
        Schema::table('notifications', function (Blueprint $table) {

            $table->dropForeign(['actor_id']);
            $table->dropForeign(['note_id']);
        });


        DB::statement('ALTER TABLE notifications ALTER COLUMN actor_id DROP NOT NULL');
        DB::statement('ALTER TABLE notifications ALTER COLUMN note_id DROP NOT NULL');

        Schema::table('notifications', function (Blueprint $table) {

            $table->foreign('actor_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('note_id')->references('id')->on('notes')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropForeign(['actor_id']);
            $table->dropForeign(['note_id']);
        });


        DB::statement('ALTER TABLE notifications ALTER COLUMN actor_id SET NOT NULL');
        DB::statement('ALTER TABLE notifications ALTER COLUMN note_id SET NOT NULL');

        Schema::table('notifications', function (Blueprint $table) {
            $table->foreign('actor_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('note_id')->references('id')->on('notes')->onDelete('cascade');
        });
    }
};
