<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Halaman notifikasi
     */
    public function index(): Response
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->with(['actor:id,name,avatar', 'note:id,title,slug'])
            ->orderByDesc('created_at')
            ->paginate(20);

        // Transform data untuk frontend
        $notifications->getCollection()->transform(function ($notification) {
            return [
                'id' => $notification->id,
                'type' => $notification->type,
                'actor' => [
                    'id' => $notification->actor->id,
                    'name' => $notification->actor->name,
                    'avatar_url' => $notification->actor->avatarUrl,
                ],
                'note' => [
                    'id' => $notification->note->id,
                    'title' => $notification->note->title,
                    'slug' => $notification->note->slug,
                ],
                'read_at' => $notification->read_at,
                'created_at' => $notification->created_at->diffForHumans(),
            ];
        });

        return Inertia::render('notifications', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * API: Get notifikasi untuk dropdown/badge
     */
    public function getNotifications(Request $request)
    {
        $limit = $request->input('limit', 10);
        
        $notifications = Notification::where('user_id', Auth::id())
            ->with(['actor:id,name,avatar', 'note:id,title,slug'])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'actor' => [
                        'id' => $notification->actor->id,
                        'name' => $notification->actor->name,
                        'avatar_url' => $notification->actor->avatarUrl,
                    ],
                    'note' => [
                        'id' => $notification->note->id,
                        'title' => $notification->note->title,
                        'slug' => $notification->note->slug,
                    ],
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at->diffForHumans(),
                ];
            });

        $unreadCount = Notification::where('user_id', Auth::id())
            ->unread()
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Tandai notifikasi sebagai sudah dibaca
     */
    public function markAsRead(Notification $notification)
    {
        // Pastikan notifikasi milik user yang login
        if ($notification->user_id !== Auth::id()) {
            abort(403);
        }

        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Tandai semua notifikasi sebagai sudah dibaca
     */
    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    /**
     * Hapus notifikasi
     */
    public function destroy(Notification $notification)
    {
        // Pastikan notifikasi milik user yang login
        if ($notification->user_id !== Auth::id()) {
            abort(403);
        }

        $notification->delete();

        return response()->json(['success' => true]);
    }
}
