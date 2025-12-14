import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { show as showProfile } from '@/routes/profile';

interface Comment {
    id: number;
    body: string;
    user: {
        id: number;
        name: string;
        avatar_url?: string | null;
    };
    created_at: string;
}

interface CommentSectionProps {
    noteSlug: string;
    noteId: number;
    currentUserId?: number;
    noteOwnerId: number;
    canComment: boolean;
    onCountChange?: (count: number) => void;
}

export function CommentSection({ noteSlug, noteId, currentUserId, noteOwnerId, canComment, onCountChange }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const getCsrfToken = () => {

        const metaToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
        if (metaToken) return metaToken;


        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'XSRF-TOKEN') {
                return decodeURIComponent(value);
            }
        }

        return '';
    };


    useEffect(() => {
        fetchComments();
    }, [noteSlug]);

    const fetchComments = async () => {
        try {
            const response = await fetch(`/notes/${noteSlug}/comments`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setComments(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || submitting) return;

        setSubmitting(true);
        try {
            const response = await fetch(`/notes/${noteSlug}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ body: newComment }),
            });

            if (response.ok) {
                const data = await response.json();
                const newComments = [data.data, ...comments];
                setComments(newComments);
                setNewComment('');
                onCountChange?.(newComments.length);
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId: number) => {
        if (!confirm('Hapus komentar ini?')) return;

        setDeletingId(commentId);
        try {
            const response = await fetch(`/notes/${noteSlug}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.ok) {
                const newComments = comments.filter(c => c.id !== commentId);
                setComments(newComments);
                onCountChange?.(newComments.length);
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const canDeleteComment = (comment: Comment) => {
        return currentUserId === comment.user.id || currentUserId === noteOwnerId;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {canComment && currentUserId && (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <Textarea
                        value={newComment}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                        placeholder="Tulis komentar..."
                        className="min-h-[100px] resize-none"
                        maxLength={2000}
                        spellCheck={false}
                    />
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                            {newComment.length}/2000
                        </span>
                        <Button type="submit" disabled={!newComment.trim() || submitting} size="sm">
                            {submitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="mr-2 h-4 w-4" />
                            )}
                            Kirim
                        </Button>
                    </div>
                </form>
            )}

            {!canComment && (
                <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
                    Login untuk berkomentar
                </div>
            )}


            <div className="space-y-4">
                {comments.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        Belum ada komentar
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 rounded-lg border p-4">
                            <Link href={showProfile({ user: comment.user.id })} className="shrink-0 hover:opacity-80 transition-opacity">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={comment.user.avatar_url ?? undefined} alt={comment.user.name} />
                                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium">
                                        {getInitials(comment.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </Link>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <Link href={showProfile({ user: comment.user.id })} className="font-medium text-sm hover:underline">
                                            {comment.user.name}
                                        </Link>
                                        <span className="mx-2 text-muted-foreground">•</span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(comment.created_at)}
                                        </span>
                                    </div>
                                    {canDeleteComment(comment) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDelete(comment.id)}
                                            disabled={deletingId === comment.id}
                                        >
                                            {deletingId === comment.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    )}
                                </div>
                                <p className="mt-2 text-sm whitespace-pre-wrap break-words">
                                    {comment.body}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
