import { useMemo, useState } from 'react';

import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { X } from 'lucide-react';

const variantClasses: Record<string, string> = {
    success:
        'border-green-200 bg-green-50 text-green-900 dark:border-green-700/70 dark:bg-green-950 dark:text-green-200',
    warning:
        'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-700/70 dark:bg-amber-950 dark:text-amber-200',
    danger:
        'border-red-200 bg-red-50 text-red-900 dark:border-red-700/70 dark:bg-red-950 dark:text-red-200',
    info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-700/60 dark:bg-blue-950 dark:text-blue-200',
};

export default function FlashBanner() {
    const { flash } = usePage<SharedData>().props;
    const [dismissedKey, setDismissedKey] = useState<string | null>(null);

    const bannerText = flash?.banner;
    const bannerStyle = flash?.bannerStyle ?? 'info';
    const bannerKey = bannerText ? `${bannerStyle}:${bannerText}` : null;

    const classes = useMemo(() => {
        return variantClasses[bannerStyle] ?? variantClasses.info;
    }, [bannerStyle]);

    if (!bannerText || !bannerKey || dismissedKey === bannerKey) {
        return null;
    }

    return (
        <div
            className={`mb-4 flex items-center justify-between rounded-lg border px-4 py-3 text-sm shadow-sm ${classes}`}
            role="alert"
        >
            <p className="font-medium">{bannerText}</p>

            <button
                type="button"
                className="ml-4 inline-flex items-center rounded-full p-1 hover:bg-white/20 focus:outline-none focus-visible:ring"
                onClick={() => setDismissedKey(bannerKey)}
                aria-label="Tutup peringatan"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

