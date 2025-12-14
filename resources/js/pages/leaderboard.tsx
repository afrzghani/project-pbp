import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { show as showProfile } from '@/routes/profile';
import { Medal, Trophy, Heart, Bookmark, Star, Building2, GraduationCap, Globe } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Leaderboard',
        href: '/leaderboard',
    },
];

interface LeaderboardUser {
    id: number;
    name: string;
    avatar_url?: string;
    acronym?: string;
    university?: { name: string } | null;
    program_study?: string;
    likes_received: number;
    bookmarks_received: number;
    total_points: number;
}

interface LeaderboardProps {
    globalUsers: LeaderboardUser[];
    universityUsers: LeaderboardUser[];
    programStudyUsers: LeaderboardUser[];
    currentUniversity: string | null;
    currentProgramStudy: string | null;
    activeTab: string;
}

const RankBadge = ({ index }: { index: number }) => {
    if (index === 0) return (
        <div className="flex items-center justify-center size-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white font-bold shadow-lg shadow-yellow-500/30">
            1
        </div>
    );
    if (index === 1) return (
        <div className="flex items-center justify-center size-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 text-white font-bold shadow-lg">
            2
        </div>
    );
    if (index === 2) return (
        <div className="flex items-center justify-center size-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 text-white font-bold shadow-lg">
            3
        </div>
    );
    return <span className="text-muted-foreground font-medium">#{index + 1}</span>;
};

const UserRow = ({ user, index, showProgramStudy = false }: { user: LeaderboardUser; index: number; showProgramStudy?: boolean }) => {
    const isTopThree = index < 3;
    const ringColors = [
        'ring-2 ring-yellow-400',
        'ring-2 ring-gray-300',
        'ring-2 ring-amber-600',
    ];

    return (
        <tr className={`border-b transition-colors hover:bg-muted/50 ${isTopThree ? 'bg-gradient-to-r from-muted/30 to-transparent' : ''}`}>
            <td className="p-4 text-center"><RankBadge index={index} /></td>
            <td className="p-4">
                <Link href={showProfile({ user: user.id })} className="flex items-center gap-3">
                    <Avatar className={`${isTopThree ? 'h-10 w-10' : 'h-8 w-8'} ${isTopThree ? ringColors[index] : ''}`}>
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium">
                            {user.acronym}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className={`font-medium hover:underline ${isTopThree ? 'text-base' : ''}`}>{user.name}</div>
                        {showProgramStudy && user.program_study && (
                            <div className="text-xs text-muted-foreground">{user.program_study}</div>
                        )}
                        {!showProgramStudy && user.university?.name && (
                            <div className="text-xs text-muted-foreground">{user.university.name}</div>
                        )}
                    </div>
                </Link>
            </td>
            <td className="p-4 text-center">
                <span className="inline-flex items-center gap-1 text-pink-500 font-medium">
                    <Heart className="size-3.5 fill-current" />
                    {user.likes_received}
                </span>
            </td>
            <td className="p-4 text-center">
                <span className="inline-flex items-center gap-1 text-blue-500 font-medium">
                    <Bookmark className="size-3.5 fill-current" />
                    {user.bookmarks_received}
                </span>
            </td>
            <td className="p-4 text-right">
                <Badge className={`${isTopThree ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-3 py-1' : 'bg-muted text-foreground'}`}>
                    {user.total_points}
                </Badge>
            </td>
        </tr>
    );
};

export default function Leaderboard({
    globalUsers,
    universityUsers,
    programStudyUsers,
    currentUniversity,
    currentProgramStudy
}: LeaderboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leaderboard" />
            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-6">

                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white shadow-lg">
                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-md">
                                <Trophy className="size-6 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight">Leaderboard</h2>
                        </div>
                        <p className="max-w-xl text-blue-100 text-lg">
                            Papan peringkat kontribusi komunitas.
                        </p>
                    </div>

                    <div className="absolute -right-12 -top-12 size-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-indigo-500/20 blur-2xl" />
                </div>

                <Tabs defaultValue="global" className="w-full space-y-6">
                    <div className="flex justify-center">
                        <TabsList className="grid w-full max-w-md grid-cols-3 h-auto p-1 bg-muted/50 rounded-full">
                            <TabsTrigger value="global" className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:shadow-sm py-2">
                                <Globe className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Global</span>
                            </TabsTrigger>
                            <TabsTrigger value="university" className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:shadow-sm py-2">
                                <Building2 className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Kampus</span>
                                <span className="sm:hidden">Kampus</span>
                            </TabsTrigger>
                            <TabsTrigger value="program" className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:shadow-sm py-2">
                                <GraduationCap className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Prodi</span>
                                <span className="sm:hidden">Prodi</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="global" className="mt-0">
                        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/30">
                                        <tr>
                                            <th className="h-12 px-4 text-center w-16 font-medium text-muted-foreground">Rank</th>
                                            <th className="h-12 px-4 text-left font-medium text-muted-foreground">User</th>
                                            <th className="h-12 px-4 text-center font-medium text-muted-foreground"><Heart className="h-4 w-4 mx-auto" /></th>
                                            <th className="h-12 px-4 text-center font-medium text-muted-foreground"><Bookmark className="h-4 w-4 mx-auto" /></th>
                                            <th className="h-12 px-4 text-right font-medium text-muted-foreground">Poin</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {globalUsers.map((user, index) => (
                                            <UserRow key={user.id} user={user} index={index} />
                                        ))}
                                        {globalUsers.length === 0 && (
                                            <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Belum ada data</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="university" className="mt-0">
                        {currentUniversity ? (
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center gap-3">
                                    <Building2 className="size-5" />
                                    <p className="text-sm font-medium">
                                        Ranking di <span className="font-bold">{currentUniversity}</span>
                                    </p>
                                </div>
                                <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="border-b bg-muted/30">
                                                <tr>
                                                    <th className="h-12 px-4 text-center w-16 font-medium text-muted-foreground">Rank</th>
                                                    <th className="h-12 px-4 text-left font-medium text-muted-foreground">User</th>
                                                    <th className="h-12 px-4 text-center font-medium text-muted-foreground"><Heart className="h-4 w-4 mx-auto" /></th>
                                                    <th className="h-12 px-4 text-center font-medium text-muted-foreground"><Bookmark className="h-4 w-4 mx-auto" /></th>
                                                    <th className="h-12 px-4 text-right font-medium text-muted-foreground">Poin</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {universityUsers.map((user, index) => (
                                                    <UserRow key={user.id} user={user} index={index} showProgramStudy={true} />
                                                ))}
                                                {universityUsers.length === 0 && (
                                                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Belum ada data</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
                                <div className="rounded-full bg-muted p-4 mb-4">
                                    <Building2 className="size-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold">Universitas belum diatur</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                                    Lengkapi profil Anda dengan universitas untuk melihat ranking kampus.
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="program" className="mt-0">
                        {currentProgramStudy ? (
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 flex items-center gap-3">
                                    <GraduationCap className="size-5" />
                                    <p className="text-sm font-medium">
                                        Ranking di <span className="font-bold">{currentProgramStudy}</span>
                                    </p>
                                </div>
                                <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="border-b bg-muted/30">
                                                <tr>
                                                    <th className="h-12 px-4 text-center w-16 font-medium text-muted-foreground">Rank</th>
                                                    <th className="h-12 px-4 text-left font-medium text-muted-foreground">User</th>
                                                    <th className="h-12 px-4 text-center font-medium text-muted-foreground"><Heart className="h-4 w-4 mx-auto" /></th>
                                                    <th className="h-12 px-4 text-center font-medium text-muted-foreground"><Bookmark className="h-4 w-4 mx-auto" /></th>
                                                    <th className="h-12 px-4 text-right font-medium text-muted-foreground">Poin</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {programStudyUsers.map((user, index) => (
                                                    <UserRow key={user.id} user={user} index={index} />
                                                ))}
                                                {programStudyUsers.length === 0 && (
                                                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Belum ada data</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
                                <div className="rounded-full bg-muted p-4 mb-4">
                                    <GraduationCap className="size-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold">Prodi belum diatur</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                                    Lengkapi profil Anda dengan program studi untuk melihat ranking prodi.
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}