import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { type FeedNote as FeedNoteType, type CommentPayload as CommentPayloadType } from '@/types';

const getCsrfToken = () =>
    document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

export default function CommentsSheet({ note, onOpenChange }: { note: FeedNoteType | null; onOpenChange: (note: FeedNoteType | null) => void; }) {
    const [comments, setComments] = useState<CommentPayloadType[]>([]);
    const [loading, setLoading] = useState(false);
    const [body, setBody] = useState('');
    const isOpen = Boolean(note);

    useEffect(() => {
        if (!note) {
            const timer = window.setTimeout(() => {
                setComments([]);
                setBody('');
            }, 0);

            return () => window.clearTimeout(timer);
        }

        const fetchComments = async () => {
            setLoading(true);
            const response = await fetch(`/notes/${note.id}/comments`, {
                headers: { Accept: 'application/json' },
            });
            if (response.ok) {
                const data = await response.json();
                setComments(data.data ?? []);
            }
            setLoading(false);
        };

        fetchComments();
    }, [note]);

    const submitComment = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!note || !body.trim()) return;

        const response = await fetch(`/notes/${note.id}/comments`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': getCsrfToken(),
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ body }),
        });

        if (response.ok) {
            const data = await response.json();
            setComments((prev) => [data.data, ...prev]);
            setBody('');
        }
    };

    const deleteComment = async (commentId: number) => {
        if (!note) return;

        const response = await fetch(`/notes/${note.id}/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': getCsrfToken(),
                Accept: 'application/json',
            },
        });

        if (response.ok) {
            setComments((prev) => prev.filter((comment) => comment.id !== commentId));
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={() => onOpenChange(null)}>
            <SheetContent side="right" className="flex w-full flex-col gap-4 sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>Komentar</SheetTitle>
                    <p className="text-sm text-muted-foreground">{note?.title ?? 'Pilih catatan'}</p>
                </SheetHeader>

                <div className="flex-1 space-y-4 overflow-y-auto">
                    {loading ? (
                        <p className="text-center text-sm text-muted-foreground">Memuat komentar...</p>
                    ) : comments.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground">Belum ada komentar. Jadilah yang pertama!</p>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="rounded-lg border p-3">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{comment.user.name}</span>
                                    <span>{comment.created_at ? new Date(comment.created_at).toLocaleString('id-ID') : ''}</span>
                                </div>
                                <p className="mt-2 text-sm">{comment.body}</p>
                                <Button variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs text-destructive" onClick={() => deleteComment(comment.id)}>
                                    Hapus
                                </Button>
                            </div>
                        ))
                    )}
                </div>

                <SheetFooter>
                    <form onSubmit={submitComment} className="w-full space-y-2">
                        <Label htmlFor="comment">Tambahkan komentar</Label>
                        <textarea
                            id="comment"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="min-h-[100px] w-full rounded-md border bg-transparent p-2 text-sm"
                            placeholder="Tuliskan tanggapan kamu..."
                        />
                        <Button type="submit" disabled={!note || !body.trim()}>
                            Kirim
                        </Button>
                    </form>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
