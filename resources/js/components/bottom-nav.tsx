import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Compass, Plus, FileText, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { title: 'Home', href: '/dashboard', icon: LayoutGrid },
    { title: 'Explore', href: '/explore', icon: Compass },
    { title: 'Buat', href: '/notes/create', icon: Plus, isCenter: true },
    { title: 'Catatan', href: '/notes', icon: FileText },
    { title: 'Profil', href: '/u/me', icon: User },
];

export function BottomNav() {
    const page = usePage();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
            <div className="flex h-16 items-center justify-around px-2 pb-safe">
                {navItems.map((item) => {
                    const isActive = item.href === '/u/me'
                        ? page.url.startsWith('/u/')
                        : page.url.startsWith(item.href);

                    if (item.isCenter) {
                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                className="flex -mt-4 h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
                            >
                                <item.icon className="size-6" />
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs transition-colors',
                                isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <item.icon className={cn('size-5', isActive && 'fill-primary/20')} />
                            <span className="font-medium">{item.title}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
