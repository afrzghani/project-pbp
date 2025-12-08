<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProgramStudy;
use App\Models\University;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgramStudyController extends Controller
{
    /**
     * Return all program studies with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        $programs = $this->buildQuery($request)
            ->orderBy('nama')
            ->get(['id', 'university_id', 'nama', 'slug', 'jenjang']);

        return response()->json(['data' => $programs]);
    }

    /**
     * Return program studies for the given university.
     */
    public function byUniversity(Request $request, University $university): JsonResponse
    {
        $programs = $this->buildQuery($request)
            ->where('university_id', $university->id)
            ->orderBy('nama')
            ->get(['id', 'university_id', 'nama', 'slug', 'jenjang']);

        return response()->json([
            'data' => $programs,
            'meta' => [
                'university' => $university->only(['id', 'nama', 'slug']),
            ],
        ]);
    }

    /**
     * @return Builder<ProgramStudy>
     */
    private function buildQuery(Request $request): Builder
    {
        $search = (string) $request->query('search');
        $universityId = $request->integer('university_id');

        return ProgramStudy::query()
            ->whereRaw('aktif IS TRUE')
            ->when($universityId, fn ($query) => $query->where('university_id', $universityId))
            ->when($search, function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('nama', 'like', "%{$search}%")
                        ->orWhere('jenjang', 'like', "%{$search}%");
                });
            });
    }
}
