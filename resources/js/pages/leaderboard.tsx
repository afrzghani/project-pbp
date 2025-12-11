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
    if (index === 0) return <Medal className="mx-auto h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="mx-auto h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="mx-auto h-5 w-5 text-amber-600" />;
    return <span className="text-neutral-500">#{index + 1}</span>;
};

const UserRow = ({ user, index, showProgramStudy = false }: { user: LeaderboardUser; index: number; showProgramStudy?: boolean }) => (
    <tr className="border-b hover:bg-muted/50">
        <td className="p-4 text-center"><RankBadge index={index} /></td>
        <td className="p-4">
            <Link href={showProfile({ user: user.id })} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.acronym}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-medium hover:underline">{user.name}</div>
                    {showProgramStudy && user.program_study && (
                        <div className="text-xs text-muted-foreground">{user.program_study}</div>
                    )}
                    {!showProgramStudy && user.university?.name && (
                        <div className="text-xs text-muted-foreground">{user.university.name}</div>
                    )}
                </div>
            </Link>
        </td>
        <td className="p-4 text-center text-pink-500 font-medium">{user.likes_received}</td>
        <td className="p-4 text-center text-blue-500 font-medium">{user.bookmarks_received}</td>
        <td className="p-4 text-right">
            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                {user.total_points}
            </Badge>
        </td>
    </tr>
);

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
            <div className="flex h-full flex-col p-6">
                <div className="mb-6">
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        Leaderboard
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Papan peringkat kontribusi komunitas
                    </p>
                </div>

                <Tabs defaultValue="global" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="global" className="gap-2">
                            <Globe className="h-4 w-4" />
                            Global
                        </TabsTrigger>
                        <TabsTrigger value="university" className="gap-2">
                            <Building2 className="h-4 w-4" />
                            Universitas Saya
                        </TabsTrigger>
                        <TabsTrigger value="program" className="gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Prodi Saya
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="global">
                        <div className="rounded-xl border bg-card overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="h-12 px-4 text-center w-16">Rank</th>
                                        <th className="h-12 px-4 text-left">User</th>
                                        <th className="h-12 px-4 text-center"><Heart className="h-4 w-4 mx-auto" /></th>
                                        <th className="h-12 px-4 text-center"><Bookmark className="h-4 w-4 mx-auto" /></th>
                                        <th className="h-12 px-4 text-right">Poin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {globalUsers.map((user, index) => (
                                        <UserRow key={user.id} user={user} index={index} />
                                    ))}
                                    {globalUsers.length === 0 && (
                                        <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Belum ada data</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>

                    <TabsContent value="university">
                        {currentUniversity ? (
                            <>
                                <div className="mb-4 p-3 rounded-lg bg-muted/50 border">
                                    <p className="text-sm text-muted-foreground">
                                        Ranking di <span className="font-medium text-foreground">{currentUniversity}</span>
                                    </p>
                                </div>
                                <div className="rounded-xl border bg-card overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="border-b bg-muted/50">
                                            <tr>
                                                <th className="h-12 px-4 text-center w-16">Rank</th>
                                                <th className="h-12 px-4 text-left">User</th>
                                                <th className="h-12 px-4 text-center"><Heart className="h-4 w-4 mx-auto" /></th>
                                                <th className="h-12 px-4 text-center"><Bookmark className="h-4 w-4 mx-auto" /></th>
                                                <th className="h-12 px-4 text-right">Poin</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {universityUsers.map((user, index) => (
                                                <UserRow key={user.id} user={user} index={index} showProgramStudy={true} />
                                            ))}
                                            {universityUsers.length === 0 && (
                                                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Belum ada data</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Lengkapi profil Anda dengan universitas untuk melihat ranking kampus</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="program">
                        {currentProgramStudy ? (
                            <>
                                <div className="mb-4 p-3 rounded-lg bg-muted/50 border">
                                    <p className="text-sm text-muted-foreground">
                                        Ranking di <span className="font-medium text-foreground">{currentProgramStudy}</span>
                                    </p>
                                </div>
                                <div className="rounded-xl border bg-card overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="border-b bg-muted/50">
                                            <tr>
                                                <th className="h-12 px-4 text-center w-16">Rank</th>
                                                <th className="h-12 px-4 text-left">User</th>
                                                <th className="h-12 px-4 text-center"><Heart className="h-4 w-4 mx-auto" /></th>
                                                <th className="h-12 px-4 text-center"><Bookmark className="h-4 w-4 mx-auto" /></th>
                                                <th className="h-12 px-4 text-right">Poin</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {programStudyUsers.map((user, index) => (
                                                <UserRow key={user.id} user={user} index={index} />
                                            ))}
                                            {programStudyUsers.length === 0 && (
                                                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Belum ada data</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                                <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Lengkapi profil Anda dengan program studi untuk melihat ranking prodi</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}


