import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Heart, MessageCircle, Bookmark, Check, Loader2, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeData {
    id: number;
    name: string;
    description: string;
    icon: string;
    tier: number;
    slug: string;
}

interface NotificationItem {
    id: number;
    type: 'like' | 'comment' | 'bookmark' | 'badge';
    actor?: {
        id: number;
        name: string;
        avatar_url?: string;
    } | null;
    note?: {
        id: number;
        title: string;
        slug: string;
    } | null;
    badge?: BadgeData | null;
    read_at: string | null;
    created_at: string;
}

const getCsrfToken = () => {
    const metaToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
    if (metaToken) return metaToken;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'XSRF-TOKEN') {
            return decodeURIComponent(value);
        }
    }
    return '';
};

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'like':
            return <Heart className="h-3.5 w-3.5 text-pink-500 shrink-0" />;
        case 'comment':
            return <MessageCircle className="h-3.5 w-3.5 text-blue-500 shrink-0" />;
        case 'bookmark':
            return <Bookmark className="h-3.5 w-3.5 text-yellow-500 shrink-0" />;
        case 'badge':
            return <Award className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
        default:
            return <Bell className="h-3.5 w-3.5 shrink-0" />;
    }
};

const getNotificationText = (type: string) => {
    switch (type) {
        case 'like':
            return 'menyukai catatan';
        case 'comment':
            return 'mengomentari';
        case 'bookmark':
            return 'menyimpan';
        case 'badge':
            return 'Badge baru:';
        default:
            return 'berinteraksi dengan';
    }
};

export function NotificationDropdown() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/notifications?limit=10', {
                headers: { 'Accept': 'application/json' },
            });
            if (!response.ok) {
                setNotifications([]);
                setUnreadCount(0);
                return;
            }
            const data = await response.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unread_count || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
            setUnreadCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: number) => {
        await fetch(`/notifications/${id}/read`, {
            method: 'POST',
            headers: {
                'X-XSRF-TOKEN': getCsrfToken(),
                'Accept': 'application/json',
            },
        });
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = async () => {
        await fetch('/notifications/read-all', {
            method: 'POST',
            headers: {
                'X-XSRF-TOKEN': getCsrfToken(),
                'Accept': 'application/json',
            },
        });
        setNotifications(prev =>
            prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
        );
        setUnreadCount(0);
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-3 py-2 border-b">
                    <span className="font-semibold text-sm">Notifikasi</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={markAllAsRead}
                        >
                            Tandai semua dibaca
                        </Button>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {loading && notifications.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            Belum ada notifikasi
                        </div>
                    ) : (
                        notifications.map((notification) => {
                            if (notification.type === 'badge' && notification.badge) {
                                return (
                                    <Link
                                        key={notification.id}
                                        href="/badges"
                                        onClick={() => {
                                            if (!notification.read_at) {
                                                markAsRead(notification.id);
                                            }
                                            setOpen(false);
                                        }}
                                        className={cn(
                                            "flex items-start gap-3 px-3 py-3 hover:bg-muted/50 transition-colors border-b last:border-b-0",
                                            !notification.read_at && "bg-amber-50 dark:bg-amber-900/10"
                                        )}
                                    >
                                        <div className="h-8 w-8 shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                            <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm leading-tight">
                                                <span className="font-medium text-amber-600 dark:text-amber-400">🎉 Badge Baru!</span>
                                            </p>
                                            <p className="text-xs text-primary font-medium truncate mt-0.5">
                                                {notification.badge.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {notification.badge.description}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {notification.created_at}
                                            </p>
                                        </div>

                                        <div className="shrink-0 mt-1">
                                            {getNotificationIcon('badge')}
                                        </div>
                                    </Link>
                                );
                            }


                            if (!notification.actor || !notification.note) {
                                return null;
                            }

                            return (
                                <Link
                                    key={notification.id}
                                    href={`/notes/${notification.note.slug}`}
                                    onClick={() => {
                                        if (!notification.read_at) {
                                            markAsRead(notification.id);
                                        }
                                        setOpen(false);
                                    }}
                                    className={cn(
                                        "flex items-start gap-3 px-3 py-3 hover:bg-muted/50 transition-colors border-b last:border-b-0",
                                        !notification.read_at && "bg-primary/5"
                                    )}
                                >
                                    <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarImage src={notification.actor.avatar_url} />
                                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium">
                                            {notification.actor.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm leading-tight">
                                            <span className="font-medium">{notification.actor.name}</span>
                                            {' '}
                                            <span className="text-muted-foreground">
                                                {getNotificationText(notification.type)}
                                            </span>
                                        </p>
                                        <p className="text-xs text-primary font-medium truncate mt-0.5">
                                            {notification.note.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {notification.created_at}
                                        </p>
                                    </div>

                                    <div className="shrink-0 mt-1">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="border-t px-3 py-2">
                        <Link
                            href="/notifications"
                            className="text-xs text-primary hover:underline block text-center"
                            onClick={() => setOpen(false)}
                        >

                        </Link>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
