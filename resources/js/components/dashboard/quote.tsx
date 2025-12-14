import { Lightbulb } from 'lucide-react';

export function QuoteBanner() {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white shadow-lg">
            <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-md">
                        <Lightbulb className="size-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Tips Belajar</h2>
                </div>
                <p className="text-blue-100 text-lg">
                    "Teknik Pomodoro: Fokus belajar selama 25 menit, lalu istirahat 5 menit. Ulangi 4 kali, lalu istirahat panjang!"
                </p>
            </div>

            <div className="absolute -right-12 -top-12 size-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-indigo-500/20 blur-2xl" />
        </div>
    );
}
