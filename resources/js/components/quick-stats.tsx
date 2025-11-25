import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, FileText, Trophy } from 'lucide-react';

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
            rank: number;
            notes_count: number;
        }>;
    };
}

export default function QuickStats({ streak, notesThisWeek, leaderboard }: QuickStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Streak Harian</CardTitle>
                    <Flame className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{streak}</div>
                    <CardDescription className="text-xs">
                        {streak === 0
                            ? 'Mulai aktivitas hari ini!'
                            : streak === 1
                              ? 'Hari berturut-turut'
                              : `${streak} hari berturut-turut`}
                    </CardDescription>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Catatan Minggu Ini</CardTitle>
                    <FileText className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{notesThisWeek}</div>
                    <CardDescription className="text-xs">
                        {notesThisWeek === 0
                            ? 'Belum ada catatan minggu ini'
                            : notesThisWeek === 1
                              ? 'catatan dibuat'
                              : 'catatan dibuat'}
                    </CardDescription>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Leaderboard Prodi</CardTitle>
                    <Trophy className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    {leaderboard.program_study ? (
                        <div>
                            <div className="text-sm font-semibold mb-1">
                                {leaderboard.program_study.nama}
                            </div>
                            {leaderboard.program_study.university && (
                                <CardDescription className="text-xs mb-2">
                                    {leaderboard.program_study.university.nama}
                                </CardDescription>
                            )}
                            {leaderboard.top_users.length > 0 ? (
                                <div className="space-y-1">
                                    {leaderboard.top_users.slice(0, 3).map((user, idx) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between text-xs"
                                        >
                                            <span className="text-muted-foreground">
                                                #{idx + 1} {user.name}
                                            </span>
                                            <span className="font-medium">{user.notes_count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <CardDescription className="text-xs">
                                    Belum ada data
                                </CardDescription>
                            )}
                        </div>
                    ) : (
                        <CardDescription className="text-xs">
                            Lengkapi profil untuk melihat leaderboard
                        </CardDescription>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

