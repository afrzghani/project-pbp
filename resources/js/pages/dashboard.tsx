import { useEffect, useState } from 'react';
import QuickStats from '@/components/quick-stats';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout'; //SAMPING KIRI
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type PaginationLink, type FeedNote, type StatsPayload } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { QuoteBanner } from '@/components/dashboard/quote-banner';
import { NoteGrid } from '@/components/dashboard/note-grid';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

const csrfToken =
    document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.content ?? '';

interface DashboardPageProps {
    stats: StatsPayload;
    recent_notes: any[];
    bookmarked_notes: any[];
}

export default function Dashboard({ stats, recent_notes, bookmarked_notes }: DashboardPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-4 md:p-6">

                {/* 1. Quote Banner */}
                <QuoteBanner />

                {/* 2. Quick Stats */}
                <QuickStats
                    streak={stats.streak}
                    notesThisWeek={stats.notes_this_week}
                    leaderboard={stats.leaderboard}
                />

                <div className="space-y-8">
                    {/* 3. Recent Notes */}
                    <NoteGrid
                        title="Terakhir Dilihat"
                        notes={recent_notes}
                        emptyMessage="Belum ada catatan yang dilihat baru-baru ini."
                    />

                    {/* 4. Bookmarked Notes */}
                    <NoteGrid
                        title="Disimpan"
                        notes={bookmarked_notes}
                        actionLink={{ label: "Selengkapnya", href: "/notes?filter=bookmarked" }}
                        emptyMessage="Belum ada catatan yang disimpan."
                    />
                </div>
            </div>
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