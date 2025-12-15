import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import { Trash2, NotebookPen, Plus, FileUp, Pencil, Calendar, Eye, Lock, Globe, X, Loader2, Clock } from 'lucide-react';
import { useState } from 'react';
import { NoteCard } from '@/components/note-card';

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
    active_label?: string;
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

    const [deleting, setDeleting] = useState<string | null>(null);
    const [pendingDeleteSlug, setPendingDeleteSlug] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDelete = (noteSlug: string) => {
        setPendingDeleteSlug(noteSlug);
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (!pendingDeleteSlug) return;
        setDeleting(pendingDeleteSlug);
        setShowDeleteDialog(false);
        router.delete(`/notes/${pendingDeleteSlug}`, {
            onFinish: () => setDeleting(null),
        });
    };

    const getVisibilityIcon = (visibility: string) => {
        switch (visibility.toLowerCase()) {
            case 'public': return <Globe className="size-3" />;
            case 'private': return <Lock className="size-3" />;
            default: return <Eye className="size-3" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'published': return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
            case 'draft': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
            case 'archived': return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
            default: return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Catatan" />

            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-6">

                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white shadow-lg">
                    <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-md">
                                    <NotebookPen className="size-6 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Catatan Saya</h2>
                            </div>
                            <p className="max-w-xl text-blue-100 text-lg">
                                Kelola ide, tugas, dan pengetahuan Anda di satu tempat.
                            </p>
                        </div>
                    </div>

                    <div className="absolute -right-12 -top-12 size-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-indigo-500/20 blur-2xl" />
                </div>

                <div className="space-y-2">
                    {notes.data.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {notes.data.map((note) => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    variant="owner"
                                    onDelete={handleDelete}
                                    deleting={deleting === note.slug}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
                            <div className="rounded-full bg-muted p-4 mb-4">
                                <NotebookPen className="size-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">Belum ada catatan</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
                                Mulai menulis ide-ide hebat Anda atau upload dokumen untuk diproses.
                            </p>
                            <Button asChild>
                                <Link href="/notes/create">
                                    <Plus className="mr-2 size-4" />
                                    Buat Catatan Pertama
                                </Link>
                            </Button>
                        </div>
                    )}

                    {notes.links.length > 3 && (
                        <div className="flex justify-center pt-4">
                            <div className="flex flex-wrap gap-2">
                                {notes.links.map((link, idx) => (
                                    <Link
                                        key={`${link.label}-${idx}`}
                                        preserveScroll
                                        href={link.url || '#'}
                                        className={`inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors ${link.active
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                            } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>


            {showDeleteDialog && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteDialog(false);
                    }}
                >
                    <div
                        className="relative w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:from-gray-900 dark:via-neutral-900/20 dark:to-blue-950/10 shadow-2xl overflow-hidden">

                            <div className="relative bg-gradient-to-r bg-white dark:from-blue-900 dark:to-blue-800 p-6 text-black dark:text-blue-100">
                                <div className="absolute top-3 right-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDeleteDialog(false);
                                        }}
                                        className="rounded-full p-1.5 hover:bg-blue-200/40 dark:hover:bg-blue-900/30 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div>
                                        <h3 className="text-xl font-bold">Hapus Catatan?</h3>
                                        <p className="text-sm text-black dark:text-white">Catatan akan dihapus secara permanen</p>
                                    </div>
                                </div>
                            </div>


                            <div className="p-6 space-y-2">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Apakah kamu yakin ingin menghapus catatan berikut?
                                    </p>
                                    <p className="font-semibold text-base bg-muted/50 rounded-lg p-3 border border-border/50">
                                        {notes.data.find(n => n.slug === pendingDeleteSlug)?.title}
                                    </p>
                                </div>
                            </div>


                            <div className="bg-muted/30 px-6 py-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                                <Button
                                    variant="outline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDeleteDialog(false);
                                    }}
                                    className="w-full sm:w-auto"
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleConfirmDelete();
                                    }}
                                    disabled={deleting !== null}
                                    className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                                >
                                    {deleting !== null ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Menghapus...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Ya, hapus sekarang
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}