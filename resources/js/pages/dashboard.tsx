import { useEffect, useState } from 'react';

import QuickStats from '@/components/quick-stats';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout'; //SAMPING KIRI
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type DashboardProps, type PaginationLink, type FeedNote } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import FeedCard from '@/components/feed/feed-card';
import CommentsSheet from '@/components/comments/comments-sheet';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

const csrfToken =
    document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.content ?? '';

export default function Dashboard({ stats, feed, filters }: DashboardProps) {
    const [searchValue, setSearchValue] = useState(filters.search ?? '');
    const [commentsNote, setCommentsNote] = useState<FeedNote | null>(null);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setSearchValue(filters.search ?? '');
        }, 0);

        return () => window.clearTimeout(timer);
    }, [filters.search]);

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const query =
            searchValue.trim().length > 0 ? { search: searchValue.trim() } : {};

        router.get(dashboard().url, query, {
            replace: true,
            preserveScroll: true,
        });
    };

    const resetSearch = () => {
        setSearchValue('');
        router.get(dashboard().url, {}, { replace: true, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <QuickStats
                    streak={stats.streak}
                    notesThisWeek={stats.notes_this_week}
                    leaderboard={stats.leaderboard}
                />

                <section>
                    <Card>
                        <CardContent className="space-y-4 p-4">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-semibold">Feed Catatan</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Cari catatan menarik dari mahasiswa lain.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 md:w-[360px]">
                                        <form
                                            onSubmit={handleSearchSubmit}
                                            className="flex flex-col gap-2 md:flex-row"
                                        >
                                            <Input
                                                id="search"
                                                placeholder="Cari judul atau ringkasan..."
                                                value={searchValue}
                                                onChange={(e) => setSearchValue(e.target.value)}
                                            />
                                            <div className="flex gap-2">
                                                <Button type="submit" size="sm">
                                                    Cari
                                                </Button>
                                                {searchValue.trim().length > 0 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={resetSearch}
                                                    >
                                                        Reset
                                                    </Button>
                                                )}
                                            </div>
                                        </form>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href="/notes/create">+ Catatan Baru</Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {feed.data.length === 0 ? (
                                <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                    Belum ada catatan sesuai pencarian. Coba kata kunci lain atau bagikan catatan pertamamu!
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {feed.data.map((note) => (
                                        <FeedCard
                                            key={note.id}
                                            note={note}
                                            onShowComments={() => setCommentsNote(note)}
                                        />
                                    ))}
                                    <Pagination links={feed.links} />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>
            </div>

            <CommentsSheet note={commentsNote} onOpenChange={setCommentsNote} />
        </AppLayout>
    );
}

function Pagination({ links }: { links: PaginationLink[] }) {
    if (!links || links.length <= 3) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center justify-end gap-2 pt-4">
            {links.map((link, index) => {
                const label = link.label
                    .replace('&laquo;', '«')
                    .replace('&raquo;', '»');

                if (!link.url) {
                    return (
                        <span key={index} className="px-3 text-sm text-muted-foreground">
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
    );
}