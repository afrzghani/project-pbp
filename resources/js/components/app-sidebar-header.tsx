import { Breadcrumbs } from '@/components/breadcrumbs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { NotificationDropdown } from '@/components/notification-dropdown';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { ChevronsUpDown, Search, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth, filters = {} } = usePage<SharedData & { filters?: { search?: string } }>().props;

    const [searchValue, setSearchValue] = useState(filters.search ?? '');

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setSearchValue(filters.search ?? '');
        }, 0);

        return () => window.clearTimeout(timer);
    }, [filters.search]);

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const query =
            searchValue.trim().length > 0 ? { search: searchValue.trim() } : {};

        router.get(dashboard().url, query, {
            replace: true,
            preserveScroll: true,
        });
    };

    const resetSearch = () => {
        setSearchValue('');
        router.get(dashboard().url, {}, { replace: true, preserveScroll: true });
    };

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex flex-1 items-center justify-center px-4">
                <form onSubmit={handleSearchSubmit} className="flex w-full max-w-md items-center gap-2">
                    <Input
                        id="search"
                        placeholder="Cari judul atau ringkasan..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="bg-background"
                    />
                    <Button type="submit" size="icon" className="w-10 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90">
                        <Search className="size-5" />
                        <span className="sr-only">Cari</span>
                    </Button>
                </form>
            </div>
            <div className="ml-auto flex items-center gap-4">
                {/* Action buttons group */}
                <div className="flex items-center gap-1">
                    <Button variant="default" size="sm" className="gap-2" onClick={() => router.visit('/notes/create')}>
                        <Plus className="size-4" />
                        <span className="hidden sm:inline">Tambah Catatan</span>
                    </Button>
                    <NotificationDropdown />
                </div>

                {/* Profile dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 outline-none">
                            <UserInfo user={auth.user} showName={false} />
                            <ChevronsUpDown className="size-4 text-muted-foreground" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-56 rounded-lg"
                        align="end"
                    >
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
