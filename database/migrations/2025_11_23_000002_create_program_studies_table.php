<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('program_studies')) {
            Schema::create('program_studies', function (Blueprint $table) {
                $table->id();
                $table->foreignId('university_id')->constrained()->cascadeOnDelete();
                $table->string('nama');
                $table->string('slug');
                $table->string('jenjang')->nullable();
                $table->boolean('aktif')->default(true);
                $table->timestamps();

                $table->unique(['university_id', 'slug']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('program_studies');
    }
};
