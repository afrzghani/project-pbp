import { Lightbulb } from 'lucide-react';

export function QuoteBanner() {
    return (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white shadow-lg">
            <div className="relative z-10 flex items-start gap-4">
                <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                    <Lightbulb className="size-6 text-yellow-300" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-lg">Tips Belajar Hari Ini</h3>
                    <p className="text-white/90 max-w-xl leading-relaxed">
                        "Teknik Pomodoro: Fokus belajar selama 25 menit, lalu istirahat 5 menit. Ulangi 4 kali, lalu istirahat panjang. Ini membantu menjaga konsentrasi!"
                    </p>
                </div>
            </div>
            <div className="absolute -right-12 -top-12 size-40 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-12 right-12 size-32 rounded-full bg-white/10 blur-2xl" />
        </div>
    );
}
