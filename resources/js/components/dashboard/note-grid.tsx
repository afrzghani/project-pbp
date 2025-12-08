import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { Calendar, Clock, Heart, MessageCircle, Bookmark, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NoteGridProps {
    title: string;
    notes: any[];
    actionLink?: {
        label: string;
        href: string;
    };
    emptyMessage?: string;
}

export function NoteGrid({ title, notes, actionLink, emptyMessage = "Belum ada catatan." }: NoteGridProps) {
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
                        <Link key={note.id} href={`/notes/${note.id}`} className="block h-full">
                            <Card className="group relative flex h-full flex-col justify-between overflow-hidden border-border/50 bg-card transition-all hover:border-primary/50 hover:shadow-md">
                                <div className="p-5">
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <FileText className="size-6" />
                                        </div>
                                        {note.tags && note.tags.length > 0 && (
                                            <Badge variant="secondary" className="bg-muted/50 font-normal">
                                                {note.tags[0].name}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="font-semibold leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                                            {note.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="size-3" />
                                                {new Date(note.published_at || note.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'short'
                                                })}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="size-3" />
                                                {note.updated_at}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto border-t border-border/50 bg-muted/20 p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500">
                                                <Heart className="size-4" />
                                                <span className="sr-only">Like</span>
                                            </Button>
                                            <span className="text-xs text-muted-foreground">{note.likes_count}</span>

                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-500 ml-2">
                                                <MessageCircle className="size-4" />
                                                <span className="sr-only">Comment</span>
                                            </Button>
                                            <span className="text-xs text-muted-foreground">{note.comments_count}</span>
                                        </div>

                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                            <Bookmark className="size-4" />
                                            <span className="sr-only">Bookmark</span>
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
