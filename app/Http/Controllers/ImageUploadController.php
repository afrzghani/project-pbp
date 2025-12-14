<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ImageUploadController extends Controller
{
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $userId = Auth::id() ?? 'guest';
            $disk = config('filesystems.default');
            $path = $file->store("uploads/images/{$userId}", $disk);
            $url = Storage::disk($disk)->url($path);

            return response()->json([
                'success' => true,
                'url' => $url
            ]);
        }

        return response()->json(['success' => false, 'error' => 'Tidak ada gambar'], 400);
    }
}
