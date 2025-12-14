<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->rememberToken();

                $table->foreignId('university_id')->nullable()->constrained()->nullOnDelete();
                $table->foreignId('program_study_id')->nullable()->constrained()->nullOnDelete();
                $table->string('cohort_year', 4)->nullable();
                $table->string('student_number')->nullable();
                $table->boolean('profile_completed')->default(false);
                $table->timestamp('profile_completed_at')->nullable();
                $table->json('profile_meta')->nullable();

                $table->text('two_factor_secret')->nullable();
                $table->text('two_factor_recovery_codes')->nullable();
                $table->timestamp('two_factor_confirmed_at')->nullable();
                

                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
