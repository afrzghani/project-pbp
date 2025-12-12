import FeedCard from '@/components/feed/feed-card';
import { show as showNote } from '@/routes/notes';
import { edit as editProfile } from '@/routes/profile';
import { NoteGrid } from '@/components/note-grid';
import { BadgeGrid } from '@/components/badges';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type FeedNote, type User, type Badge, type BadgeStats } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Edit, FileText, GraduationCap, University } from 'lucide-react';

interface ProfileStats {
    notes_count: number;
}

interface ProfileUser extends User {
    university?: { name: string } | null;
    program_study?: { name: string } | null;
    username?: string;
    profile_photo_url?: string;
    acronym?: string;
}

interface ProfileShowProps {
    profileUser: ProfileUser;
    stats: ProfileStats;
    recentNotes: FeedNote[];
    isOwnProfile: boolean;
    badges: Badge[];
    badgeStats: BadgeStats;
}

export default function ProfileShow({ profileUser, stats, recentNotes, isOwnProfile, badges, badgeStats }: ProfileShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Profile',
            href: isOwnProfile ? '/u/me' : `/u/${profileUser.id}`,
        },
        {
            title: profileUser.name,
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={profileUser.name} />
            <div className="flex h-full">
                <aside className="hidden w-80 border-r bg-sidebar lg:block">
                    <div className="h-16 border-b px-6 flex items-center justify-center">
                        <span className='font-semibold'>Profile Details</span>
                    </div>
                    <div className="flex flex-col items-center px-6 py-8 text-center">
                        <Avatar className="mb-4 h-24 w-24">
                            <AvatarImage src={profileUser.avatar_url || undefined} alt={profileUser.name} />
                            <AvatarFallback className="text-xl">{profileUser.acronym}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-1">{profileUser.name}</h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {profileUser.email}
                        </p>

                        {isOwnProfile && (
                            <Button asChild size="sm" variant="outline" className="mt-4 w-full">
                                <Link href={editProfile()}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Profile
                                </Link>
                            </Button>
                        )}
                    </div>

                    <Separator />

                    <div className="px-6 py-6 space-y-4">
                        <div className="flex items-start gap-3 text-sm">
                            <University className="mt-0.5 h-4 w-4 text-neutral-500" />
                            <div>
                                <span className="block font-medium text-neutral-900 dark:text-neutral-100">University</span>
                                <span className="text-neutral-500 dark:text-neutral-400">{profileUser.university?.name ?? 'Not set'}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                            <GraduationCap className="mt-0.5 h-4 w-4 text-neutral-500" />
                            <div>
                                <span className="block font-medium text-neutral-900 dark:text-neutral-100">Study Program</span>
                                <span className="text-neutral-500 dark:text-neutral-400">{profileUser.program_study?.name ?? 'Not set'}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                            <Calendar className="mt-0.5 h-4 w-4 text-neutral-500" />
                            <div>
                                <span className="block font-medium text-neutral-900 dark:text-neutral-100">Joined</span>
                                <span className="text-neutral-500 dark:text-neutral-400">
                                    Member since {new Date(profileUser.created_at || Date.now()).getFullYear()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="px-6 py-6">
                        <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                            Recent Activity
                        </h4>
                        <div className="space-y-4">
                            {recentNotes.length > 0 ? (
                                recentNotes.slice(0, 3).map(note => (
                                    /* @ts-ignore */
                                    <Link key={note.id} href={`/notes/${note.slug}`} className="block group">
                                        <div className="text-sm font-medium text-neutral-900 group-hover:text-blue-600 dark:text-neutral-100 dark:group-hover:text-blue-400 line-clamp-1">
                                            {note.title}
                                        </div>
                                        <div className="text-xs text-neutral-500">
                                            {new Date(note.published_at || Date.now()).toLocaleDateString()}
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-sm text-neutral-500 italic">No recent activity.</p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    <div className="px-6 py-6">
                        <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                            Badges
                        </h4>
                        <BadgeGrid badges={badges} stats={badgeStats} maxDisplay={6} />
                    </div>
                </aside>

                <div className="flex flex-1 flex-col p-6 overflow-y-auto">
                    <div className="mb-6 flex items-end justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                Published Notes
                            </h1>
                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                Browse notes published by {profileUser.name}.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-1 shadow-sm dark:bg-neutral-900">
                            <FileText className="h-4 w-4 text-neutral-500" />
                            <span className="text-sm font-bold">{stats.notes_count}</span>
                            <span className="text-sm text-neutral-500">Notes</span>
                        </div>
                    </div>

                    {recentNotes.length > 0 ? (
                        <NoteGrid className='mt-0'>
                            {recentNotes.map((note) => (
                                <FeedCard key={note.id} note={note} />
                            ))}
                        </NoteGrid>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 py-16 dark:border-neutral-800 dark:bg-neutral-900/50">
                            <div className="text-center">
                                <h3 className="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                    No notes published
                                </h3>
                                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                    {profileUser.name} hasn't published any notes yet.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
