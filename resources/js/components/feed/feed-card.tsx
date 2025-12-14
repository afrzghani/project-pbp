import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Heart, Bookmark, MessageCircle, Flame, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type FeedNote as FeedNoteType } from '@/types';

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

export default function FeedCard({ note, source }: { note: FeedNoteType; source?: string }) {
    const [liked, setLiked] = useState(note.liked);
    const [likesCount, setLikesCount] = useState(note.likes_count);
    const [bookmarked, setBookmarked] = useState(note.bookmarked);
    const [bookmarksCount, setBookmarksCount] = useState(note.bookmarks_count);
    const [pending, setPending] = useState(false);

    const summary = note.ai_summary ?? note.excerpt ?? 'Belum ada ringkasan.';
    const linkHref = `/read/${note.slug}${source ? `?from=${source}` : ''}`;

    const toggleLike = async () => {
        setPending(true);
        try {
            const response = await fetch(`/notes/${note.slug}/like`, {
                method: liked ? 'DELETE' : 'POST',
                headers: {
                    'X-XSRF-TOKEN': getCsrfToken(),
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                console.error('Gagal memperbarui like');
                return;
            }

            const data = await response.json();
            setLiked(data.liked);
            setLikesCount(data.likes_count);
        } finally {
            setPending(false);
        }
    };

    const toggleBookmark = async () => {
        setPending(true);
        try {
            const response = await fetch(`/notes/${note.slug}/bookmark`, {
                method: bookmarked ? 'DELETE' : 'POST',
                headers: {
                    'X-XSRF-TOKEN': getCsrfToken(),
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                console.error('Gagal memperbarui bookmark');
                return;
            }

            const data = await response.json();
            setBookmarked(data.bookmarked);
            setBookmarksCount(data.bookmarks_count);
        } finally {
            setPending(false);
        }
    };

    const handleBookmark = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark();
    };

    return (
        <div className="group block rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
            <Link href={linkHref}>
                <header className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                        <span className="flex-1 text-lg font-semibold text-primary group-hover:underline transition-colors">
                            {note.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {note.published_at
                                ? new Date(note.published_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })
                                : ''}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {note.user.name} •{' '}
                        {(typeof note.user.program_study === 'object' && note.user.program_study
                            ? (note.user.program_study as any).name
                            : note.user.program_study) ?? 'Program tidak tersedia'}{' '}
                        •{' '}
                        {(typeof note.user.university === 'object' && note.user.university
                            ? (note.user.university as any).name
                            : note.user.university_short ?? note.user.university) ?? 'Kampus'}
                    </p>
                </header>

                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{summary}</p>

                {note.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {note.tags.map((tag) => (
                            <Badge key={tag.id} variant="secondary">
                                #{tag.name}
                            </Badge>
                        ))}
                    </div>
                )}

                {note.ai_flashcards_count && note.ai_flashcards_count > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                        <span>{note.ai_flashcards_count} flashcard tersedia</span>
                    </div>
                )}
            </Link>

            <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3 relative z-10">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                    <Button
                        type="button"
                        variant={liked ? 'default' : 'outline'}
                        size="sm"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleLike();
                        }}
                        disabled={pending}
                        className="gap-2"
                    >
                        {pending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
                        )}
                        {likesCount}
                    </Button>

                    <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                        {note.comments_count}
                    </span>

                    <Button
                        type="button"
                        variant={bookmarked ? 'default' : 'outline'}
                        size="sm"
                        className="gap-2"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleBookmark(e);
                        }}
                        disabled={pending}
                    >
                        <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-current')} />
                        {bookmarksCount}
                    </Button>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="gap-2 text-primary hover:text-primary/90"
                >
                    <Link href={linkHref}>
                        <span>
                            Baca Selengkapnya
                            <ArrowRight className="h-4 w-4 inline ml-2" />
                        </span>
                    </Link>
                </Button>
            </footer>
        </div>
    );
}