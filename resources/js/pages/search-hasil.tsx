import { usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { NoteCard } from '@/components/note-card';
import { Search } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Hasil Pencarian', href: '/search-hasil' },
];

export default function SearchResults(props: any) {
    const page = usePage();
    const query = props.q || page.props.q || '';
    const results = props.results || page.props.results || [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Hasil Pencarian: ${query}`} />
            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-6">

                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white shadow-lg">
                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-md">
                                <Search className="size-6 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight">Hasil Pencarian</h2>
                        </div>
                        <p className="max-w-xl text-blue-100 text-lg">
                            Menampilkan catatan untuk kata kunci: <span className="font-semibold">"{query}"</span>
                        </p>
                    </div>

                    <div className="absolute -right-12 -top-12 size-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-indigo-500/20 blur-2xl" />
                </div>

                <div className="space-y-6">
                    {results.length > 0 ? (
                        <>
                            <p className="text-sm text-muted-foreground">
                                Ditemukan {results.length} catatan
                            </p>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {results.map((note: any) => (
                                    <NoteCard
                                        key={note.id}
                                        note={note}
                                        source="search"
                                        variant="feed"
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
                            <div className="rounded-full bg-muted p-4 mb-4">
                                <Search className="size-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">Tidak ada hasil</h3>
                            <p className="text-muted-foreground">
                                Tidak ada catatan ditemukan untuk pencarian "{query}".
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
