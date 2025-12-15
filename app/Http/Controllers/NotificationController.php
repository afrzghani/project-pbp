<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(): Response
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->with(['actor:id,name,avatar', 'note:id,title,slug'])
            ->orderByDesc('created_at')
            ->paginate(20);


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

    public function getNotifications(Request $request)
    {
        try {
            $limit = $request->input('limit', 10);
            
            $notifications = Notification::where('user_id', Auth::id())
                ->with(['actor:id,name,avatar', 'note:id,title,slug', 'badge'])
                ->orderByDesc('created_at')
                ->limit($limit)
                ->get()
                ->map(function ($notification) {
                    $result = [
                        'id' => $notification->id,
                        'type' => $notification->type,
                        'read_at' => $notification->read_at,
                        'created_at' => $notification->created_at?->diffForHumans() ?? '',
                    ];

                    if ($notification->type === 'badge' && $notification->badge) {
                        $result['badge'] = [
                            'id' => $notification->badge->id,
                            'name' => $notification->badge->name,
                            'description' => $notification->badge->description,
                            'icon' => $notification->badge->icon,
                            'tier' => $notification->badge->tier,
                            'slug' => $notification->badge->slug,
                        ];
                    } else {
                        $result['actor'] = $notification->actor ? [
                            'id' => $notification->actor->id,
                            'name' => $notification->actor->name,
                            'avatar_url' => $notification->actor->avatarUrl,
                        ] : null;
                        $result['note'] = $notification->note ? [
                            'id' => $notification->note->id,
                            'title' => $notification->note->title,
                            'slug' => $notification->note->slug,
                        ] : null;
                    }

                    return $result;
                });

            $unreadCount = Notification::where('user_id', Auth::id())
                ->unread()
                ->count();

            return response()->json([
                'notifications' => $notifications,
                'unread_count' => $unreadCount,
            ]);
        } catch (\Exception $e) {
            \Log::error('Notification fetch error: ' . $e->getMessage());
            return response()->json([
                'notifications' => [],
                'unread_count' => 0,
            ]);
        }
    }

    public function markAsRead(Notification $notification)
    {
        if ($notification->user_id !== Auth::id()) {
            abort(403);
        }

        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    public function destroy(Notification $notification)
    {
        if ($notification->user_id !== Auth::id()) {
            abort(403);
        }

        $notification->delete();

        return response()->json(['success' => true]);
    }
}
