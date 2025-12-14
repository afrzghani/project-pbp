<?php

namespace Database\Factories;

use App\Models\University;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<University>
 */
class UniversityFactory extends Factory
{
    protected $model = University::class;

    public function definition(): array
    {
        $name = fake()->unique()->company() . ' University';
        $domainPrefix = Str::slug(fake()->unique()->word());

        return [
            'nama' => $name,
            'slug' => Str::slug($name),
            'domain' => "{$domainPrefix}.ac.id",
            'domain_aliases' => null,
            'singkatan' => strtoupper(Str::substr($name, 0, 4)),
            'kota' => fake()->city(),
            'aktif' => true,
        ];
    }
}


