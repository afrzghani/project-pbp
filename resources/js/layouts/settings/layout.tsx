import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { cn, isSameUrl, resolveUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { User, Key, Shield, Palette, Settings } from 'lucide-react';
import { type PropsWithChildren } from 'react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: User,
    },
    {
        title: 'Password',
        href: editPassword(),
        icon: Key,
    },
    {
        title: 'Two-Factor Auth',
        href: show(),
        icon: Shield,
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: Palette,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {

    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white shadow-lg">
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-md">
                            <Settings className="size-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                    </div>
                    <p className="text-blue-100 text-lg">
                        Kelola profil dan pengaturan akun Anda.
                    </p>
                </div>

                <div className="absolute -right-12 -top-12 size-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-indigo-500/20 blur-2xl" />
            </div>


            <div className="flex justify-center">
                <nav className="inline-flex gap-1 p-1 bg-muted/50 rounded-full">
                    {sidebarNavItems.map((item, index) => {
                        const isActive = isSameUrl(currentPath, item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={`${resolveUrl(item.href)}-${index}`}
                                href={item.href}
                                className={cn(
                                    'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                                    isActive
                                        ? 'bg-white dark:bg-neutral-900 shadow-sm text-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-neutral-900/50'
                                )}
                            >
                                {Icon && <Icon className="size-4" />}
                                <span className="hidden sm:inline">{item.title}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>


            <div className="max-w-2xl mx-auto w-full">
                <div className="rounded-2xl border bg-card shadow-sm p-6">
                    <section className="space-y-8">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}