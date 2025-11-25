<?php

namespace Database\Factories;

use App\Models\ProgramStudy;
use App\Models\University;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProgramStudy>
 */
class ProgramStudyFactory extends Factory
{
    protected $model = ProgramStudy::class;

    public function definition(): array
    {
        $name = 'Teknik ' . ucfirst(fake()->unique()->word());

        return [
            'university_id' => University::factory(),
            'nama' => $name,
            'slug' => Str::slug($name),
            'jenjang' => 'S1',
            'aktif' => true,
        ];
    }
}


