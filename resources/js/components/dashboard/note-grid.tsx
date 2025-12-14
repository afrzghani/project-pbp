import { NoteCard } from '@/components/note-card';
import { Link } from '@inertiajs/react';

interface NoteGridProps {
    title: string;
    notes: any[];
    actionLink?: {
        label: string;
        href: string;
    };
    emptyMessage?: string;
    source?: string;
}

export function NoteGrid({ title, notes, actionLink, emptyMessage = "Belum ada catatan.", source }: NoteGridProps) {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                {actionLink && (
                    <Link
                        href={actionLink.href}
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        {actionLink.label}
                    </Link>
                )}
            </div>

            {notes.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    {emptyMessage}
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {notes.map((note) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            source={source}
                            variant="dashboard"
                        />
                    ))}
                </div>
            )}
        </section>
    );
}