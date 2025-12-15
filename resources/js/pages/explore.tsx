import { FeedTabs } from '@/components/feed/feed-tabs';
import { NoteCard } from '@/components/note-card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type FeedNote, type FeedPagination } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

interface ExploreProps {
    feed: FeedPagination;
    filters: { search?: string; tab?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Explore',
        href: '/explore',
    },
];

export default function Explore({ feed, filters }: ExploreProps) {
    const [activeTab, setActiveTab] = useState(filters.tab || 'for-you');

    const handleTabChange = useCallback((tab: string) => {
        setActiveTab(tab);
        router.get('/explore', { tab }, { preserveState: true, preserveScroll: true });
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Explore" />
            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-6">

                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white shadow-lg">
                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-md">
                                <Compass className="size-6 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight">Explore</h2>
                        </div>
                        <p className="max-w-xl text-blue-100 text-lg">
                            Temukan catatan menarik, trending, dan terbaru dari komunitas.
                        </p>
                    </div>

                    <div className="absolute -right-12 -top-12 size-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-indigo-500/20 blur-2xl" />
                </div>

                <div className="flex flex-col gap-6">
                    <FeedTabs activeTab={activeTab} onTabChange={handleTabChange} />

                    <div className="space-y-6">
                        {feed?.data?.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {feed.data.map((note) => (
                                        <NoteCard
                                            key={note.id}
                                            note={note}
                                            source="explore"
                                            variant="feed"
                                        />
                                    ))}
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-2 pt-8">
                                    {feed.links?.map((link, index) => {
                                        const label = link.label
                                            .replace('&laquo;', '«')
                                            .replace('&raquo;', '»')
                                            .replace('Previous', 'Sebelumnya')
                                            .replace('Next', 'Selanjutnya');

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
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
                                <div className="rounded-full bg-muted p-4 mb-4">
                                    <Compass className="size-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold">Belum ada catatan</h3>
                                <p className="text-muted-foreground">
                                    Belum ada catatan untuk ditampilkan saat ini.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}