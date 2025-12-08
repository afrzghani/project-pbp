import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem, type User } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { show as showProfile } from '@/routes/profile';
import { Medal, Trophy } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Leaderboard',
        href: '/leaderboard',
    },
];

interface LeaderboardUser extends User {
    notes_count: number;
    username?: string;
    profile_photo_url?: string;
    acronym?: string;
    university?: { name: string } | null;
}

export default function Leaderboard({ users }: { users: LeaderboardUser[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leaderboard" />
            <div className="flex h-full flex-col p-6">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            <Trophy className="h-6 w-6 text-yellow-500" />
                            Community Leaderboard
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Top contributors sharing knowledge with the community.
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-neutral-100/50 data-[state=selected]:bg-neutral-100 dark:hover:bg-neutral-800/50 dark:data-[state=selected]:bg-neutral-800">
                                <th className="h-12 px-4 text-center align-middle font-medium text-neutral-500 dark:text-neutral-400 w-16">Rank</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-neutral-500 dark:text-neutral-400">User</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-neutral-500 dark:text-neutral-400">Published Notes</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {users.map((user, index) => (
                                <tr key={user.id} className="border-b transition-colors hover:bg-neutral-100/50 data-[state=selected]:bg-neutral-100 dark:hover:bg-neutral-800/50 dark:data-[state=selected]:bg-neutral-800">
                                    <td className="p-4 text-center align-middle font-medium">
                                        {index === 0 && <Medal className="mx-auto h-5 w-5 text-yellow-500" />}
                                        {index === 1 && <Medal className="mx-auto h-5 w-5 text-gray-400" />}
                                        {index === 2 && <Medal className="mx-auto h-5 w-5 text-amber-600" />}
                                        {index > 2 && <span className="text-neutral-500">#{index + 1}</span>}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <Link href={showProfile({ user: user.id })} className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.profile_photo_url} alt={user.name} />
                                                <AvatarFallback>{user.acronym ?? user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-neutral-900 dark:text-neutral-100 hover:underline">
                                                    {user.name}
                                                </div>
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    {(user as any).university?.name ?? 'Unknown University'}
                                                </div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="p-4 text-right align-middle">
                                        <Badge variant="secondary" className="font-mono">
                                            {user.notes_count}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-4 text-center align-middle h-24">
                                        No data available yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
