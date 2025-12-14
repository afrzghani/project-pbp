import { type Badge } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

interface BadgeIconProps {
    badge: Badge;
    size?: 'sm' | 'md' | 'lg';
    showTooltip?: boolean;
    className?: string;
}

const tierColors: Record<1 | 2 | 3 | 4 | 5, { bg: string; text: string; ring: string }> = {
    1: { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-neutral-600 dark:text-neutral-400', ring: 'ring-neutral-300 dark:ring-neutral-600' },
    2: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', ring: 'ring-green-300 dark:ring-green-600' },
    3: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-300 dark:ring-blue-600' },
    4: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', ring: 'ring-purple-300 dark:ring-purple-600' },
    5: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-300 dark:ring-amber-600' },
};

const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
};

const iconSizes = {
    sm: 14,
    md: 18,
    lg: 24,
};

function getIconComponent(iconName: string): React.ComponentType<{ size?: number; className?: string }> | null {
    const pascalCase = iconName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

    // @ts-ignore
    return LucideIcons[pascalCase] || LucideIcons.Award;
}

export function BadgeIcon({ badge, size = 'md', showTooltip = true, className }: BadgeIconProps) {
    const colors = tierColors[badge.tier];
    const IconComponent = getIconComponent(badge.icon);
    const isEarned = badge.earned !== false;

    const badgeElement = (
        <div
            className={cn(
                'flex items-center justify-center rounded-full ring-2 transition-all',
                sizeClasses[size],
                isEarned ? colors.bg : 'bg-neutral-100 dark:bg-neutral-800',
                isEarned ? colors.text : 'text-neutral-400 dark:text-neutral-600',
                isEarned ? colors.ring : 'ring-neutral-200 dark:ring-neutral-700',
                !isEarned && 'opacity-40 grayscale',
                className
            )}
        >
            {IconComponent && <IconComponent size={iconSizes[size]} />}
        </div>
    );

    if (!showTooltip) {
        return badgeElement;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{badgeElement}</TooltipTrigger>
                <TooltipContent>
                    <div className="text-center">
                        <p className="font-semibold">{badge.name}</p>
                        <p className="text-xs text-neutral-500">{badge.description}</p>
                        {!isEarned && <p className="text-xs text-neutral-400 mt-1">Belum diperoleh</p>}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
