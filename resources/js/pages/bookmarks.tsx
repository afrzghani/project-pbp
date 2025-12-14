import { NoteCard } from '@/components/note-card';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Bookmark as BookmarkIcon } from 'lucide-react';
import { type BreadcrumbItem, type FeedNote } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Bookmarks',
        href: '/bookmarks',
    },
];

export default function Bookmarks({ notes }: { notes: { data: FeedNote[]; links: any } }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bookmarks" />
            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-6">

                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white shadow-lg">
                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-md">
                                <BookmarkIcon className="size-6 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight">Bookmarks</h2>
                        </div>
                        <p className="max-w-xl text-blue-100 text-lg">
                            Koleksi catatan favorit yang telah Anda simpan.
                        </p>
                    </div>

                    <div className="absolute -right-12 -top-12 size-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-indigo-500/20 blur-2xl" />
                </div>

                <div className="space-y-6">
                    {notes.data.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {notes.data.map((note) => (
                                <NoteCard key={note.id} note={note} source="bookmarks" variant="feed" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
                            <div className="rounded-full bg-muted p-4 mb-4">
                                <BookmarkIcon className="size-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">Belum ada bookmark</h3>
                            <p className="text-muted-foreground">
                                Mulai mengeksplorasi dan simpan catatan yang menarik.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}