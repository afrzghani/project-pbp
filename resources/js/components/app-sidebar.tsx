import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, FileText, Trophy, User, Compass, Bookmark } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Explore',
        href: '/explore',
        icon: Compass,
    },
    {
        title: 'Catatan',
        href: '/notes',
        icon: FileText,
    },
    {
        title: 'Bookmarks',
        href: '/bookmarks',
        icon: Bookmark,
    },
    {
        title: 'Leaderboard',
        href: '/leaderboard',
        icon: Trophy,
    },
    {
        title: 'Profil',
        href: '/u/me',
        icon: User,
    },
];

const footerNavItems: NavItem[] = [

];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
            </SidebarFooter>
        </Sidebar>
    );
}
