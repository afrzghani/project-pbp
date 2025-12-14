<?php

use App\Http\Controllers\Api\ProgramStudyController;
use App\Http\Controllers\Api\UniversityController;
use Illuminate\Support\Facades\Route;

Route::middleware('api')->group(function () {
    Route::get('universities', [UniversityController::class, 'index'])->name('api.universities.index');
    Route::get('program-studies', [ProgramStudyController::class, 'index'])->name('api.program-studies.index');
    Route::get('universities/{university}/program-studies', [ProgramStudyController::class, 'byUniversity'])
        ->name('api.universities.program-studies');
});



