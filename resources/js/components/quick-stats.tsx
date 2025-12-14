import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Flame, FileText, Trophy, TrendingUp } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface QuickStatsProps {
    streak: number;
    notesThisWeek: number;
    leaderboard: {
        program_study: {
            id: number;
            nama: string;
            university: {
                id: number;
                nama: string;
            } | null;
        } | null;
        top_users: Array<{
            id: number;
            name: string;
            avatar_url?: string | null;
            rank: number;
            total_points: number;
        }>;
    };
}


export default function QuickStats({ streak, notesThisWeek, leaderboard }: QuickStatsProps) {

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-orange-50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25">
                                    <Flame className="size-5" />
                                </div>
                                <span className="text-sm font-medium text-muted-foreground">Streak Harian</span>
                            </div>
                            <div>
                                <span className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                    {streak}
                                </span>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {streak === 0 ? 'Mulai aktivitas hari ini!' : 'hari berturut-turut'}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25">
                                    <FileText className="size-5" />
                                </div>
                                <span className="text-sm font-medium text-muted-foreground">Minggu Ini</span>
                            </div>
                            <div>
                                <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    {notesThisWeek}
                                </span>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {notesThisWeek === 0 ? 'Belum ada catatan' : 'catatan dibuat'}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>


            <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-purple-50 to-violet-50/50 dark:from-purple-950/20 dark:to-violet-950/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                <CardContent className="p-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/25">
                                    <Trophy className="size-5" />
                                </div>
                                <span className="text-sm font-medium text-muted-foreground">Leaderboard</span>
                            </div>
                            <Link
                                href="/leaderboard"
                                className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                            >
                                Lihat <TrendingUp className="size-3" />
                            </Link>
                        </div>

                        {leaderboard.program_study ? (
                            <div className="space-y-3">
                                <p className="text-xs text-muted-foreground truncate">
                                    {leaderboard.program_study.nama}
                                </p>

                                {leaderboard.top_users.length > 0 ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <div className="flex -space-x-2">
                                                {leaderboard.top_users.slice(0, 3).map((user, idx) => (
                                                    <Avatar
                                                        key={user.id}
                                                        className={`size-8 ring-2 ring-background ${idx === 0 ? 'z-30' : idx === 1 ? 'z-20' : 'z-10'
                                                            }`}
                                                    >
                                                        <AvatarImage src={user.avatar_url ?? undefined} alt={user.name} />
                                                        <AvatarFallback className={`text-xs font-medium text-white ${idx === 0
                                                            ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
                                                            : idx === 1
                                                                ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                                                                : 'bg-gradient-to-br from-amber-600 to-amber-700'
                                                            }`}>
                                                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                ))}
                                            </div>
                                            <span className="ml-3 text-xs text-muted-foreground">
                                                {leaderboard.top_users.length} kontributor
                                            </span>
                                        </div>


                                        <div className="space-y-1.5">
                                            {leaderboard.top_users.slice(0, 3).map((user, idx) => (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center justify-between text-xs"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-bold ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : 'text-amber-600'
                                                            }`}>
                                                            #{idx + 1}
                                                        </span>
                                                        <span className="text-foreground truncate max-w-[100px]">{user.name}</span>
                                                    </div>
                                                    <span className="font-semibold text-purple-600">{user.total_points}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">Belum ada data</p>
                                )}
                            </div>
                        ) : (
                            <div className="py-2">
                                <p className="text-sm text-muted-foreground">
                                    Lengkapi profil untuk melihat leaderboard prodi
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
