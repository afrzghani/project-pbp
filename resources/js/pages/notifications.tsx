import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import { Bell, Heart, MessageCircle, Bookmark, Check, CheckCheck, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notifikasi',
        href: '/notifications',
    },
];

interface NotificationItem {
    id: number;
    type: 'like' | 'comment' | 'bookmark';
    actor: {
        id: number;
        name: string;
        avatar_url?: string;
    };
    note: {
        id: number;
        title: string;
        slug: string;
    };
    read_at: string | null;
    created_at: string;
}

interface NotificationsProps {
    notifications: {
        data: NotificationItem[];
        links: any[];
        current_page: number;
        last_page: number;
    };
}

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'like':
            return <Heart className="h-4 w-4 text-pink-500" />;
        case 'comment':
            return <MessageCircle className="h-4 w-4 text-blue-500" />;
        case 'bookmark':
            return <Bookmark className="h-4 w-4 text-yellow-500" />;
        default:
            return <Bell className="h-4 w-4" />;
    }
};

const getNotificationText = (type: string, actorName: string) => {
    switch (type) {
        case 'like':
            return `${actorName} menyukai catatan Anda`;
        case 'comment':
            return `${actorName} mengomentari catatan Anda`;
        case 'bookmark':
            return `${actorName} menyimpan catatan Anda`;
        default:
            return `${actorName} berinteraksi dengan catatan Anda`;
    }
};

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

export default function Notifications({ notifications }: NotificationsProps) {
    const markAsRead = async (id: number) => {
        await fetch(`/notifications/${id}/read`, {
            method: 'POST',
            headers: {
                'X-XSRF-TOKEN': getCsrfToken(),
                'Accept': 'application/json',
            },
        });
        router.reload({ only: ['notifications'] });
    };

    const markAllAsRead = async () => {
        await fetch('/notifications/read-all', {
            method: 'POST',
            headers: {
                'X-XSRF-TOKEN': getCsrfToken(),
                'Accept': 'application/json',
            },
        });
        router.reload({ only: ['notifications'] });
    };

    const deleteNotification = async (id: number) => {
        await fetch(`/notifications/${id}`, {
            method: 'DELETE',
            headers: {
                'X-XSRF-TOKEN': getCsrfToken(),
                'Accept': 'application/json',
            },
        });
        router.reload({ only: ['notifications'] });
    };

    const unreadCount = notifications.data.filter(n => !n.read_at).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifikasi" />
            <div className="flex h-full flex-col p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <Bell className="h-6 w-6" />
                            Notifikasi
                            {unreadCount > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                    {unreadCount} baru
                                </Badge>
                            )}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Aktivitas terbaru pada catatan Anda
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button variant="outline" size="sm" onClick={markAllAsRead}>
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Tandai Semua Dibaca
                        </Button>
                    )}
                </div>

                <div className="rounded-xl border bg-card">
                    {notifications.data.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Belum ada notifikasi</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.data.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex items-start gap-4 p-4 transition-colors hover:bg-muted/50",
                                        !notification.read_at && "bg-primary/5"
                                    )}
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={notification.actor.avatar_url} />
                                        <AvatarFallback>
                                            {notification.actor.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            {getNotificationIcon(notification.type)}
                                            <p className="text-sm">
                                                {getNotificationText(notification.type, notification.actor.name)}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/notes/${notification.note.slug}`}
                                            className="text-sm font-medium text-primary hover:underline line-clamp-1 mt-1 block"
                                        >
                                            {notification.note.title}
                                        </Link>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {notification.created_at}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {!notification.read_at && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => markAsRead(notification.id)}
                                                title="Tandai sudah dibaca"
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => deleteNotification(notification.id)}
                                            title="Hapus notifikasi"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>


                {notifications.last_page > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {notifications.links?.map((link, index) => {
                            const label = link.label
                                .replace('&laquo;', '«')
                                .replace('&raquo;', '»');

                            if (!link.url) {
                                return (
                                    <span key={index} className="px-3 py-1 text-sm text-muted-foreground">
                                        {label}
                                    </span>
                                );
                            }

                            return (
                                <Button
                                    key={index}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    asChild
                                >
                                    <Link href={link.url}>{label}</Link>
                                </Button>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
