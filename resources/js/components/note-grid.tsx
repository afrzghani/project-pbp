import { cn } from '@/lib/utils';
import { type ComponentProps } from 'react';

export function NoteGrid({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            className={cn(
                'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
                className
            )}
            {...props}
        />
    );
}