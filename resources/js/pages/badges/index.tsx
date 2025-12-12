import { type Badge, type BadgeStats } from '@/types';
import { BadgeIcon } from '@/components/badges';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

interface CategorizedBadges {
    [category: string]: Badge[];
}

interface BadgesIndexProps {
    categorizedBadges: CategorizedBadges;
    stats: BadgeStats;
}

const categoryTitles: Record<string, string> = {
    content_creator: 'Content Creator',
    engagement: 'Engagement',
    bookmarks: 'Bookmarks',
    community: 'Community',
    leaderboard: 'Leaderboard',
    streak: 'Streak',
    university: 'University Pride',
    special: 'Special',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Badges', href: '/badges' },
];

export default function BadgesIndex({ categorizedBadges, stats }: BadgesIndexProps) {
    const categoryOrder = [
        'content_creator',
        'engagement',
        'bookmarks',
        'community',
        'leaderboard',
        'streak',
        'university',
        'special',
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Badges" />

            <div className="p-6 max-w-4xl mx-auto">

                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">Badges</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        Koleksi achievement yang telah kamu peroleh
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-medium">
                            {stats.earned} / {stats.total} badge diperoleh
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {categoryOrder.map((category) => {
                        const badges = categorizedBadges[category];
                        if (!badges || badges.length === 0) return null;

                        return (
                            <div key={category}>
                                <h2 className="text-lg font-semibold mb-4">
                                    {categoryTitles[category] || category}
                                </h2>
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                                    {badges.map((badge: Badge) => (
                                        <div key={badge.id} className="flex flex-col items-center gap-2">
                                            <BadgeIcon badge={badge} size="md" />
                                            <span
                                                className={`text-xs text-center line-clamp-2 ${badge.earned
                                                        ? 'text-neutral-700 dark:text-neutral-300'
                                                        : 'text-neutral-400 dark:text-neutral-600'
                                                    }`}
                                            >
                                                {badge.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
