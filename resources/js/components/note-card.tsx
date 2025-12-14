import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link, router } from '@inertiajs/react';
import {
    Heart,
    MessageCircle,
    Bookmark,
    Folder,
    Flame,
    Globe,
    Lock,
    Eye,
    Clock,
    Pencil,
    Trash2,
    Loader2,
    X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';


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

interface NoteCardProps {
    note: any;
    source?: string;
    variant?: 'dashboard' | 'feed' | 'owner';
    onDelete?: (slug: string) => void;
    deleting?: boolean;
}

export function NoteCard({ note, source, variant = 'dashboard', onDelete, deleting = false }: NoteCardProps) {

    const [liked, setLiked] = useState(note.liked || false);
    const [likesCount, setLikesCount] = useState(note.likes_count || 0);
    const [bookmarked, setBookmarked] = useState(note.bookmarked || false);
    const [bookmarksCount, setBookmarksCount] = useState(note.bookmarks_count || 0);
    const [pending, setPending] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const baseRoute = variant === 'owner' ? '/notes' : '/read';
    const linkHref = `${baseRoute}/${note.slug}${source ? `?from=${source}` : ''}`;


    const toggleLike = async () => {
        if (variant !== 'feed') return;
        setPending(true);
        try {
            const response = await fetch(`/notes/${note.slug}/like`, {
                method: liked ? 'DELETE' : 'POST',
                credentials: 'include',
                headers: {
                    'X-XSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) return;

            const data = await response.json();
            setLiked(data.liked);
            setLikesCount(data.likes_count);
        } finally {
            setPending(false);
        }
    };

    const toggleBookmark = async () => {
        if (variant !== 'feed') return;
        setPending(true);
        try {
            const response = await fetch(`/notes/${note.slug}/bookmark`, {
                method: bookmarked ? 'DELETE' : 'POST',
                credentials: 'include',
                headers: {
                    'X-XSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) return;

            const data = await response.json();
            setBookmarked(data.bookmarked);
            setBookmarksCount(data.bookmarks_count);
        } finally {
            setPending(false);
        }
    };


    const getVisibilityIcon = (visibility: string) => {
        switch (visibility?.toLowerCase()) {
            case 'public': return <Globe className="size-3" />;
            case 'private': return <Lock className="size-3" />;
            default: return <Eye className="size-3" />;
        }
    };


    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'published': return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
            case 'draft': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
            case 'archived': return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
            default: return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
        }
    };


    const handleConfirmDelete = () => {
        if (variant === 'owner') return;
        if (onDelete) {
            onDelete(note.slug);
        }
        setShowDeleteDialog(false);
    };

    return (
        <>
            <Card className="group relative flex h-full flex-col justify-between overflow-hidden border-border/50 bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5">
                <Link href={linkHref} className="block flex-1">
                    <div className="p-5 flex flex-col gap-4">

                        {variant === 'owner' ? (
                            /* Owner: Status badges */
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`capitalize flex items-center gap-1.5 px-2 py-0.5 text-xs h-6 ${getStatusColor(note.status)}`}>
                                    {note.status}
                                </Badge>
                                <Badge variant="outline" className="flex items-center gap-1.5 bg-background/50 backdrop-blur-sm px-2 py-0.5 text-xs h-6">
                                    {getVisibilityIcon(note.visibility)}
                                    <span className="capitalize">{note.visibility}</span>
                                </Badge>
                                {variant === 'owner' && note.updated_at && (
                                    <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="size-3" />
                                        {note.updated_at}
                                    </span>
                                )}
                            </div>
                        ) : (
                            /* Feed/Dashboard: User info with avatar */
                            <div className="flex items-center gap-3">
                                <Avatar className="size-10 ring-2 ring-background shadow-sm">
                                    <AvatarImage src={note.user?.avatar_url} alt={note.user?.name} />
                                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium">
                                        {note.user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{note.user?.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {typeof note.user?.program_study === 'string'
                                            ? note.user.program_study
                                            : (note.user?.program_study?.name ?? note.user?.program_study?.nama ?? 'Program Study')}
                                    </p>
                                </div>
                            </div>
                        )}


                        <h3 className="text-lg font-semibold leading-snug tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                            {note.title}
                        </h3>


                        {(note.excerpt || note.ai_summary) && variant !== 'owner' && (
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                {note.ai_summary || note.excerpt}
                            </p>
                        )}


                        {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {note.tags.slice(0, 3).map((tag: any, index: number) => (
                                    <Badge
                                        key={tag.id || index}
                                        variant="secondary"
                                        className="bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 hover:bg-blue-500/20 font-normal text-xs"
                                    >
                                        #{tag.name}
                                    </Badge>
                                ))}
                                {note.tags.length > 3 && (
                                    <span className="text-xs text-muted-foreground self-center">
                                        +{note.tags.length - 3}
                                    </span>
                                )}
                            </div>
                        )}


                        {(note.has_flashcards || note.ai_flashcards_count > 0) && (
                            <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                                <Flame className="size-4" />
                                <span>{note.ai_flashcards_count || ''} Flashcard tersedia</span>
                            </div>
                        )}
                    </div>
                </Link>


                <div className="mt-auto border-t border-border/50 bg-muted/20 px-5 py-3">
                    {variant === 'owner' ? (
                        /* Owner Actions */
                        <div className="flex items-center justify-end">
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-blue-600"
                                    onClick={() => router.visit(`/notes/${note.slug}/edit`)}
                                    title="Edit"
                                >
                                    <Pencil className="size-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600"
                                    onClick={() => { if (onDelete) onDelete(note.slug); }}
                                    disabled={deleting}
                                    title="Hapus"
                                >
                                    {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* Stats & Interactive Buttons */
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            {variant === 'feed' ? (
                                <>
                                    <Button
                                        type="button"
                                        variant={liked ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => toggleLike()}
                                        disabled={pending}
                                        className={cn("gap-1.5 px-3 py-1.5 h-8", liked && "bg-red-500 hover:bg-red-600 text-white")}
                                    >
                                        <Heart className={cn("size-4", liked && "fill-current")} />
                                        <span>{likesCount}</span>
                                    </Button>
                                    <span className="flex items-center gap-1.5 px-2 py-1.5">
                                        <MessageCircle className="size-4" />
                                        {note.comments_count ?? 0}
                                    </span>
                                    <Button
                                        type="button"
                                        variant={bookmarked ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => toggleBookmark()}
                                        disabled={pending}
                                        className={cn("gap-1.5 px-3 py-1.5 h-8", bookmarked && "bg-blue-500 hover:bg-blue-600 text-white")}
                                    >
                                        <Bookmark className={cn("size-4", bookmarked && "fill-current")} />
                                        <span>{bookmarksCount}</span>
                                    </Button>
                                </>
                            ) : (
                                /* Dashboard / Read-only Stats */
                                <>
                                    <span className="flex items-center gap-1">
                                        <Heart className="size-3.5" />
                                        {note.likes_count ?? 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MessageCircle className="size-3.5" />
                                        {note.comments_count ?? 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Bookmark className="size-3.5" />
                                        {note.bookmarks_count ?? 0}
                                    </span>
                                </>
                            )}

                            {note.has_flashcards && (
                                <span className="ml-auto flex items-center gap-1 text-orange-600 dark:text-orange-500">
                                    <Flame className="size-3.5" />
                                    <span className="hidden sm:inline">Flashcard tersedia</span>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </Card>


            {variant !== 'owner' && showDeleteDialog && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteDialog(false);
                    }}
                >
                    <div
                        className="relative w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-gradient-to-br from-white via-neutral-50/30 to-blue-50/20 dark:from-gray-900 dark:via-neutral-900/20 dark:to-blue-950/10 shadow-2xl overflow-hidden">

                            <div className="relative bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 p-6 text-blue-900 dark:text-blue-100">
                                <div className="absolute top-3 right-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDeleteDialog(false);
                                        }}
                                        className="rounded-full p-1.5 hover:bg-blue-200/40 dark:hover:bg-blue-900/30 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-200/60 dark:bg-blue-900/40 text-3xl">
                                        <span role="img" aria-label="delete">🗑️</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Hapus Catatan?</h3>
                                        <p className="text-sm text-blue-700 dark:text-blue-200">Catatan akan dihapus secara permanen</p>
                                    </div>
                                </div>
                            </div>


                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Apakah kamu yakin ingin menghapus catatan berikut?
                                    </p>
                                    <p className="font-semibold text-base bg-muted/50 rounded-lg p-3 border border-border/50">
                                        {note.title}
                                    </p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Tindakan ini tidak dapat dibatalkan. Semua data terkait akan hilang.
                                </p>
                            </div>


                            <div className="bg-muted/30 px-6 py-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                                <Button
                                    variant="outline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDeleteDialog(false);
                                    }}
                                    className="w-full sm:w-auto"
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleConfirmDelete();
                                    }}
                                    disabled={deleting}
                                    className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Menghapus...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Ya, hapus sekarang
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}