import { type Badge } from '@/types';
import { BadgeIcon } from './badge-icon';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

interface BadgeModalProps {
    badge: Badge | null;
    open: boolean;
    onClose: () => void;
}

const tierNames: Record<1 | 2 | 3 | 4 | 5, string> = {
    1: 'Common',
    2: 'Uncommon',
    3: 'Rare',
    4: 'Epic',
    5: 'Legendary',
};

export function BadgeModal({ badge, open, onClose }: BadgeModalProps) {
    if (!badge) return null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <DialogTitle className="text-center">🎉 Selamat!</DialogTitle>
                    <DialogDescription className="text-center">
                        Kamu mendapatkan badge baru!
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center py-6 space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 blur-xl opacity-50 animate-pulse">
                            <BadgeIcon badge={badge} size="lg" showTooltip={false} />
                        </div>
                        <BadgeIcon badge={badge} size="lg" showTooltip={false} />
                    </div>

                    <div className="text-center space-y-1">
                        <h3 className="text-xl font-bold">{badge.name}</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {badge.description}
                        </p>
                        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                            {tierNames[badge.tier]}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={onClose}>
                        Tutup
                    </Button>
                    <Button asChild className="flex-1">
                        <Link href="/badges">Lihat Semua Badge</Link>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
