import { FeedTabs } from '@/components/feed/feed-tabs';
import FeedCard from '@/components/feed/feed-card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type FeedNote, type FeedPagination } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ExploreProps {
    feed: FeedPagination;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Explore',
        href: '/explore',
    },
];

export default function Explore({ feed }: ExploreProps) {
    const [activeTab, setActiveTab] = useState('for-you');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Explore" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-semibold tracking-tight">Explore</h2>
                        <p className="text-muted-foreground">
                            Temukan catatan menarik, trending, dan terbaru dari komunitas.
                        </p>
                    </div>

                    <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
                </div>

                <div className="space-y-4">
                    {feed?.data?.length > 0 ? (
                        <>
                            {feed.data.map((note) => (
                                <FeedCard
                                    key={note.id}
                                    note={note}
                                />
                            ))}
                            <div className="flex flex-wrap items-center justify-end gap-2 pt-4">
                                {feed.links?.map((link, index) => {
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
                        </>
                    ) : (
                        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                            Belum ada catatan untuk ditampilkan saat ini.
                        </p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
