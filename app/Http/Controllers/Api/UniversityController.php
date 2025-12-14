<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\University;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UniversityController extends Controller
{
    /**
     * Return a list of active universities for dropdown/filter usage.
     */
    public function index(Request $request): JsonResponse
    {
        $search = (string) $request->query('search');

        $universities = University::query()
            ->select(['id', 'nama', 'slug', 'singkatan', 'kota', 'domain'])
            ->whereRaw('aktif IS TRUE')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('nama', 'like', "%{$search}%")
                        ->orWhere('singkatan', 'like', "%{$search}%")
                        ->orWhere('domain', 'like', "%{$search}%");
                });
            })
            ->orderBy('nama')
            ->get();

        return response()->json([
            'data' => $universities,
        ]);
    }
}
