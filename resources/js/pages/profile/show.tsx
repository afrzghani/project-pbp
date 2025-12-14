import { NoteCard } from '@/components/note-card';
import { NoteGrid } from '@/components/note-grid';
import { show as showNote } from '@/routes/notes';
import { edit as editProfile } from '@/routes/profile';
import { BadgeGrid } from '@/components/badges';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type FeedNote, type User, type Badge, type BadgeStats } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Edit, FileText, GraduationCap, University, Trophy } from 'lucide-react';

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

            <div className="flex flex-col gap-8 p-4 md:p-6 max-w-7xl mx-auto w-full">

                <div className="flex flex-col items-center justify-center text-center space-y-4 py-8 bg-gradient-to-r from-blue-500 to-blue-400 rounded-2xl border border-sidebar-border/50 backdrop-blur-sm">
                    <Avatar className="h-32 w-32 ring-4 ring-background shadow-xl">
                        <AvatarImage src={profileUser.avatar_url || undefined} alt={profileUser.name} />
                        <AvatarFallback className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                            {profileUser.acronym}
                        </AvatarFallback>
                    </Avatar>

                    <div className="space-y-2 max-w-2xl px-4">
                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-white">
                            {profileUser.name}
                        </h1>

                        {profileUser.username && (
                            <p className="text-lg text-muted-foreground font-medium">@{profileUser.username}</p>
                        )}

                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground pt-2">
                            {(profileUser.program_study?.name) && (
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-blue-500" />
                                    <span>{profileUser.program_study.name}</span>
                                </div>
                            )}

                            {(profileUser.university?.name) && (
                                <div className="flex items-center gap-2">
                                    <University className="h-4 w-4 text-white" />
                                    <span className="text-white">{profileUser.university.name}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-white" />
                                <span className="text-white">Bergabung sejak {new Date(profileUser.created_at || Date.now()).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {isOwnProfile && (
                        <div className="pt-4">
                            <Button asChild variant="outline" className="rounded-full px-6 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20 transition-all">
                                <Link href={editProfile()}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Profile
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="space-y-8 lg:col-span-1">

                        <div className="bg-card rounded-xl border p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                    Lencana
                                </h3>
                                <span className="text-xs font-medium bg-muted px-2 py-1 rounded-full">
                                    {badges.length} Terbuka
                                </span>
                            </div>
                            <BadgeGrid badges={badges} stats={badgeStats} maxDisplay={6} />
                        </div>
                    </div>


                    <div className="space-y-6 lg:col-span-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Catatan Terpublikasi</h2>
                                <p className="text-muted-foreground text-sm mt-1">
                                    Kumpulan catatan yang dibagikan oleh {profileUser.name.split(' ')[0]}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border shadow-sm">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <span className="font-bold">{stats.notes_count}</span>
                                <span className="text-muted-foreground text-sm">Catatan</span>
                            </div>
                        </div>

                        {recentNotes.length > 0 ? (
                            <NoteGrid className="mt-0 grid-cols-1 md:grid-cols-2">
                                {recentNotes.map((note) => (
                                    <NoteCard key={note.id} note={note} variant="feed" />
                                ))}
                            </NoteGrid>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-xl border border-dashed bg-muted/30">
                                <div className="bg-muted rounded-full p-4 mb-4">
                                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                                <h3 className="font-semibold text-lg">No notes published yet</h3>
                                <p className="text-muted-foreground text-sm max-w-sm mt-2">
                                    {profileUser.name} hasn't published any notes to the community yet.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}