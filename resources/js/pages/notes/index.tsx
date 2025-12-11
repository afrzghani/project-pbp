import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface NoteItem {
    id: number;
    slug: string;
    title: string;
    status: string;
    visibility: string;
    updated_at: string | null;
    tags: Array<{ id: number; name: string; slug: string; color?: string | null }>;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface NotesPageProps {
    notes: {
        data: NoteItem[];
        links: PaginationLink[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Catatan', href: '/notes' },
];

export default function NotesIndex({ notes }: NotesPageProps) {
    const [deleting, setDeleting] = useState<number | null>(null);

    const handleDelete = (noteId: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
            return;
        }

        setDeleting(noteId);
        router.delete(`/notes/${noteId}`, {
            onFinish: () => setDeleting(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Catatan" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Catatan Saya</h1>
                        <p className="text-sm text-muted-foreground">
                            Tulis catatan ala Notion atau unggah PDF untuk diproses AI
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href="/notes/create">Catatan Baru</Link>
                        </Button>
                        <Button variant="secondary">Upload PDF</Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="divide-y p-0">
                        {notes.data.length === 0 ? (
                            <div className="p-6 text-center text-muted-foreground">
                                Belum ada catatan. Mulai dengan tombol "Catatan Baru".
                            </div>
                        ) : (
                            notes.data.map((note) => (
                                <div
                                    key={note.id}
                                    onClick={() => router.visit(`/notes/${note.slug}`)}
                                    className="group flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between hover:bg-muted/50 transition-colors cursor-pointer"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-base font-semibold text-primary group-hover:underline">
                                                {note.title}
                                            </span>
                                            <Badge variant="secondary">{note.status}</Badge>
                                            <Badge variant="outline">{note.visibility}</Badge>
                                        </div>
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            {note.updated_at ? `Diperbarui ${note.updated_at}` : 'Belum pernah diperbarui'}
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {note.tags.map((tag) => (
                                                <Badge key={tag.id} variant="outline">
                                                    {tag.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 relative z-10" onClick={(e) => e.stopPropagation()}>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.visit(`/notes/${note.slug}/edit`);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDelete(note.id);
                                            }}
                                            disabled={deleting === note.id}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            {deleting === note.id ? 'Menghapus...' : 'Hapus'}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {notes.links.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                        {notes.links.map((link, idx) => (
                            <Link
                                key={`${link.label}-${idx}`}
                                preserveScroll
                                href={link.url || '#'}
                                className={`rounded-md border px-3 py-1 text-sm ${link.active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                                    } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
