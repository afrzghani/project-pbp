import { type Badge, type BadgeStats } from '@/types';
import { BadgeIcon } from './badge-icon';
import { Link } from '@inertiajs/react';

interface BadgeGridProps {
    badges: Badge[];
    stats?: BadgeStats;
    showAll?: boolean;
    maxDisplay?: number;
}

export function BadgeGrid({ badges, stats, showAll = false, maxDisplay = 8 }: BadgeGridProps) {
    const displayBadges = showAll ? badges : badges.slice(0, maxDisplay);
    const hasMore = badges.length > maxDisplay && !showAll;

    return (
        <div className="space-y-3">
            {stats && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">
                        {stats.earned} / {stats.total} lencana
                    </span>
                    {hasMore && (
                        <Link
                            href="/badges"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium"
                        >
                            Lihat Semua
                        </Link>
                    )}
                </div>
            )}

            {badges.length === 0 ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 italic">
                    Belum ada badge yang diperoleh
                </p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {displayBadges.map((badge) => (
                        <BadgeIcon key={badge.id} badge={badge} size="sm" />
                    ))}
                    {hasMore && (
                        <Link
                            href="/badges"
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600 ring-2 ring-neutral-200 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:ring-neutral-700 dark:hover:bg-neutral-700"
                        >
                            +{badges.length - maxDisplay}
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
