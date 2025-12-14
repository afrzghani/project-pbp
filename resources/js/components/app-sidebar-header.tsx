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
import { Search, Plus } from 'lucide-react';
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
        const q = searchValue.trim();
        if (q.length > 0) {
            router.visit(`/search-hasil?q=${encodeURIComponent(q)}`);
        }
    };

    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-3 py-8 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:h-16 md:px-4">

            <div className="hidden md:flex items-center gap-2 shrink-0">
                <SidebarTrigger className="-ml-1" />
                <div className="hidden md:block">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>


            <div className="flex flex-1 items-center justify-center min-w-0 px-1 md:px-4">
                <form onSubmit={handleSearchSubmit} className="flex w-full max-w-md items-center gap-1.5">
                    <Input
                        id="search"
                        placeholder="Cari catatan..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="bg-background h-9 text-sm"
                        spellCheck={false}
                    />
                    <Button type="submit" size="icon" className="h-9 w-9 shrink-0 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90">
                        <Search className="size-4" />
                    </Button>
                </form>
            </div>


            <div className="flex items-center gap-3 shrink-0">
                <Button
                    variant="default"
                    size="icon"
                    className="hidden md:flex h-9 w-9 md:w-auto md:px-3 md:gap-2"
                    onClick={() => router.visit('/notes/create')}
                >
                    <Plus className="size-4" />
                    <span className="hidden md:inline text-sm">Tambah Catatan</span>
                </Button>
                <NotificationDropdown />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center outline-none">
                            <UserInfo user={auth.user} showName={false} />
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
