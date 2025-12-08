import FeedCard from '@/components/feed/feed-card';
import { NoteGrid } from '@/components/note-grid';
import { type BreadcrumbItem, type FeedNote } from '@/types';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

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
            <div className="flex h-full flex-col p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Bookmarked Notes
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Notes you have saved for later.
                    </p>
                </div>


                {notes.data.length > 0 ? (
                    <NoteGrid className='mt-0'>
                        {notes.data.map((note) => (
                            <FeedCard key={note.id} note={note} onShowComments={() => { }} />
                        ))}
                    </NoteGrid>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 py-16 dark:border-neutral-800 dark:bg-neutral-900/50">
                        <div className="text-center">
                            <h3 className="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                No bookmarks yet
                            </h3>
                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                Start exploring and bookmark notes you find interesting.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
