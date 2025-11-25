import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { Edit, Trash2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Shuffle, RefreshCcw, Flame, Calendar, Eye, EyeOff, RotateCw, ArrowLeft, Tag as TagIcon, Heart, MessageCircle, Bookmark, FileText, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface NoteTag {
    id: number;
    name: string;
    slug: string;
    color?: string | null;
}

interface Flashcard {
    question: string;
    answer: string;
    index?: number;
}

interface NoteResource {
    id: number;
    user_id: number;
    title: string;
    excerpt?: string | null;
    content_html?: string | null;
    content_text?: string | null;
    status: string;
    visibility: string;
    tags: NoteTag[];
    ai_summary?: string | null;
    ai_flashcards?: Flashcard[];
    ai_status?: string | null;
    ai_completed_at?: string | null;
    likes_count?: number;
    comments_count?: number;
    bookmarks_count?: number;
    liked_by_user?: boolean;
    bookmarked_by_user?: boolean;
    file_url?: string | null;
    file_original_name?: string | null;
    attachments?: {
        id: number;
        file_name: string;
        file_type: string;
        url: string;
        mime_type: string;
        size: number;
    }[];
    created_at: string;
    updated_at: string;
}

interface NoteShowProps {
    note: NoteResource;
    isOwner: boolean;
    auth?: {
        user?: {
            id: number;
        };
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Catatan', href: '/notes' },
];

export default function NoteShow({ note, isOwner = false }: NoteShowProps) {
    const { auth } = usePage().props as { auth?: { user?: { id: number } } };
    const [deleting, setDeleting] = useState(false);
    const [flashcardsOpen, setFlashcardsOpen] = useState(false);
    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [shuffledFlashcards, setShuffledFlashcards] = useState<Flashcard[]>([]);
    const [liked, setLiked] = useState(note.liked_by_user ?? false);
    const [likesCount, setLikesCount] = useState(note.likes_count ?? 0);
    const [liking, setLiking] = useState(false);
    const [bookmarked, setBookmarked] = useState(note.bookmarked_by_user ?? false);
    const [bookmarksCount, setBookmarksCount] = useState(note.bookmarks_count ?? 0);
    const [bookmarking, setBookmarking] = useState(false);
    const [viewingPdfUrl, setViewingPdfUrl] = useState<string | null>(null);

    const isPublic = note.visibility === 'public' && note.status === 'published';
    const canInteract = isPublic && !isOwner;

    const flashcards = note.ai_flashcards ?? [];
    const displayFlashcards = shuffledFlashcards.length > 0 ? shuffledFlashcards : flashcards;
    const currentFlashcard = displayFlashcards[currentFlashcardIndex];

    // Keyboard shortcuts for flashcard navigation
    useEffect(() => {
        if (!flashcardsOpen || displayFlashcards.length === 0) return;

        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    if (currentFlashcardIndex > 0) {
                        setCurrentFlashcardIndex(currentFlashcardIndex - 1);
                        setIsFlipped(false);
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (currentFlashcardIndex < displayFlashcards.length - 1) {
                        setCurrentFlashcardIndex(currentFlashcardIndex + 1);
                        setIsFlipped(false);
                    }
                    break;
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    setIsFlipped(!isFlipped);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [flashcardsOpen, isFlipped, currentFlashcardIndex, displayFlashcards.length]);

    const handleDelete = () => {
        if (!confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
            return;
        }

        setDeleting(true);
        router.delete(`/notes/${note.id}`, {
            onFinish: () => setDeleting(false),
            onSuccess: () => router.visit('/notes'),
        });
    };

    const handleShuffle = () => {
        const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
        setShuffledFlashcards(shuffled);
        setCurrentFlashcardIndex(0);
        setIsFlipped(false);
    };

    const handleReset = () => {
        setShuffledFlashcards([]);
        setCurrentFlashcardIndex(0);
        setIsFlipped(false);
    };

    const handlePrev = () => {
        if (currentFlashcardIndex > 0) {
            setCurrentFlashcardIndex(currentFlashcardIndex - 1);
            setIsFlipped(false);
        }
    };

    const handleNext = () => {
        if (currentFlashcardIndex < displayFlashcards.length - 1) {
            setCurrentFlashcardIndex(currentFlashcardIndex + 1);
            setIsFlipped(false);
        }
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('handleLike called', { canInteract, liking, liked });

        if (!canInteract || liking) {
            console.log('Cannot like:', { canInteract, liking });
            return;
        }

        setLiking(true);
        const url = `/notes/${note.id}/like`;
        const method = liked ? 'delete' : 'post';

        try {
            console.log('Sending like request:', { url, method });
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            console.log('Like response:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Like data:', data);
                setLiked(data.liked);
                setLikesCount(data.likes_count);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setLiking(false);
        }
    };

    const handleBookmark = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!canInteract || bookmarking) {
            return;
        }

        setBookmarking(true);
        const url = `/notes/${note.id}/bookmark`;
        const method = bookmarked ? 'delete' : 'post';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                setBookmarked(data.bookmarked);
                setBookmarksCount(data.bookmarks_count);
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        } finally {
            setBookmarking(false);
        }
    };

    return (
        <AppLayout breadcrumbs={[...breadcrumbs, { title: note.title, href: '#' }]}>
            <Head title={note.title} />

            <div className="flex flex-1 flex-col">
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
                    <div className="flex items-center justify-between gap-4 p-4">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold tracking-tight">{note.title}</h1>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className="uppercase text-xs">
                                    {note.status}
                                </Badge>
                                <Badge variant="outline" className="capitalize text-xs">
                                    {note.visibility}
                                </Badge>
                                {note.tags.length > 0 && (
                                    <>
                                        <Separator orientation="vertical" className="h-4" />
                                        {note.tags.map((tag) => (
                                            <Badge key={tag.id} variant="outline" className="text-xs">
                                                <TagIcon className="mr-1 h-3 w-3" />
                                                {tag.name}
                                            </Badge>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isOwner ? (
                                <>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/notes/${note.id}/edit`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Link>
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        {deleting ? 'Menghapus...' : 'Hapus'}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {isPublic && (
                                        <>
                                            <Button
                                                type="button"
                                                variant={liked ? "default" : "outline"}
                                                size="sm"
                                                onClick={handleLike}
                                                disabled={liking}
                                                className="gap-2"
                                            >
                                                <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                                                {likesCount}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="gap-2"
                                                asChild
                                            >
                                                <Link href={`/notes/${note.id}#comments`}>
                                                    <MessageCircle className="h-4 w-4" />
                                                    {note.comments_count ?? 0}
                                                </Link>
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={bookmarked ? "default" : "outline"}
                                                size="sm"
                                                onClick={handleBookmark}
                                                disabled={bookmarking}
                                                className="gap-2"
                                            >
                                                <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
                                                {bookmarksCount}
                                            </Button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-6">
                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>Dibuat {new Date(note.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</span>
                        </div>
                        {note.updated_at !== note.created_at && (
                            <>
                                <Separator orientation="vertical" className="h-4" />
                                <div className="flex items-center gap-1.5">
                                    <RotateCw className="h-4 w-4" />
                                    <span>Diperbarui {new Date(note.updated_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* AI Summary */}
                    {note.ai_summary && (
                        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50/50 dark:border-green-800 dark:from-green-950/20 dark:to-emerald-950/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <div className="rounded-full bg-green-100 p-1.5 dark:bg-green-900/30">
                                        <Flame className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    Ringkasan AI
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed text-foreground">{note.ai_summary}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Konten Catatan</CardTitle>
                            {note.excerpt && (
                                <CardDescription className="text-base italic">{note.excerpt}</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>
                            {note.content_html || note.content_text ? (
                                <div
                                    className="tiptap-content prose prose-lg max-w-none dark:prose-invert overflow-auto"
                                    // allow tables and wide content to scroll horizontally
                                    dangerouslySetInnerHTML={{ __html: note.content_html || `<p>${note.content_text}</p>` || '' }}
                                />
                            ) : (
                                <p className="text-muted-foreground italic">Belum ada konten.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Flashcards Section */}
                    {flashcards.length > 0 && (
                        <Card className="overflow-hidden">
                            <Collapsible open={flashcardsOpen} onOpenChange={setFlashcardsOpen}>
                                <CollapsibleTrigger asChild>
                                    <CardHeader className="cursor-pointer transition-colors hover:bg-muted/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
                                                    <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">
                                                        Flashcard AI
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {flashcards.length} kartu tersedia • Klik untuk {flashcardsOpen ? 'menutup' : 'membuka'}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            {flashcardsOpen ? (
                                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                    </CardHeader>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <CardContent className="space-y-4 p-6">
                                        {/* Progress Indicator */}
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span>Kartu {currentFlashcardIndex + 1} dari {displayFlashcards.length}</span>
                                            <div className="flex gap-1">
                                                {displayFlashcards.map((_, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={cn(
                                                            'h-1.5 w-1.5 rounded-full transition-colors',
                                                            idx === currentFlashcardIndex
                                                                ? 'bg-primary'
                                                                : 'bg-muted'
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Flashcard Viewer */}
                                        <div className="relative">
                                            <Card
                                                className={cn(
                                                    'group min-h-[360px] cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:shadow-lg',
                                                    isFlipped
                                                        ? 'border-primary bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg'
                                                        : 'border-primary/20 bg-card hover:border-primary/40'
                                                )}
                                                onClick={handleFlip}
                                            >
                                                <CardHeader className="flex flex-row items-center justify-between border-b">
                                                    <CardTitle className="text-base">
                                                        {isFlipped ? 'Jawaban' : 'Pertanyaan'}
                                                    </CardTitle>
                                                    <Badge
                                                        variant={isFlipped ? 'secondary' : 'outline'}
                                                        className="text-xs"
                                                    >
                                                        {isFlipped ? (
                                                            <Eye className="mr-1 h-3 w-3" />
                                                        ) : (
                                                            <EyeOff className="mr-1 h-3 w-3" />
                                                        )}
                                                        Klik untuk flip
                                                    </Badge>
                                                </CardHeader>
                                                <CardContent className="flex min-h-[280px] items-center justify-center p-8">
                                                    {currentFlashcard ? (
                                                        <p className="text-center text-xl font-medium leading-relaxed">
                                                            {isFlipped ? currentFlashcard.answer : currentFlashcard.question}
                                                        </p>
                                                    ) : (
                                                        <p className="text-muted-foreground">Tidak ada flashcard</p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Keyboard Hint */}
                                        <p className="text-center text-xs text-muted-foreground">
                                            💡 Gunakan panah kiri/kanan untuk navigasi, Space/Enter untuk flip
                                        </p>

                                        {/* Controls */}
                                        <div className="flex flex-wrap items-center justify-center gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={handlePrev}
                                                disabled={currentFlashcardIndex === 0}
                                                size="sm"
                                                className="gap-2"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Sebelumnya
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handleFlip}
                                                size="sm"
                                                className="gap-2"
                                            >
                                                {isFlipped ? (
                                                    <>
                                                        <EyeOff className="h-4 w-4" />
                                                        Lihat Pertanyaan
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="h-4 w-4" />
                                                        Lihat Jawaban
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handleNext}
                                                disabled={currentFlashcardIndex === displayFlashcards.length - 1}
                                                size="sm"
                                                className="gap-2"
                                            >
                                                Berikutnya
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                            <Separator orientation="vertical" className="h-6" />
                                            <Button
                                                variant="secondary"
                                                onClick={handleShuffle}
                                                size="sm"
                                                className="gap-2"
                                            >
                                                <Shuffle className="h-4 w-4" />
                                                Acak
                                            </Button>
                                            {shuffledFlashcards.length > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    onClick={handleReset}
                                                    size="sm"
                                                    className="gap-2"
                                                >
                                                    <RefreshCcw className="h-4 w-4" />
                                                    Reset
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </CollapsibleContent>
                            </Collapsible>
                        </Card>
                    )}


                    {/* Legacy Single Attachment */}
                    {note.file_url && !note.attachments?.length && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Lampiran
                                </CardTitle>
                                <CardDescription>
                                    {note.file_original_name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary">
                                            {note.file_original_name?.toLowerCase().endsWith('.pdf') ? 'PDF' : 'File'}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                            {note.file_original_name}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        {note.file_original_name?.toLowerCase().endsWith('.pdf') && (
                                            <Button
                                                onClick={() => setViewingPdfUrl(note.file_url || null)}
                                                className="gap-2"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Lihat PDF
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            asChild
                                        >
                                            <a href={note.file_url} download target="_blank" rel="noopener noreferrer" className="gap-2">
                                                Download
                                            </a>
                                        </Button>
                                    </div>

                                    {/* PDF Preview iframe */}
                                    {note.file_original_name?.toLowerCase().endsWith('.pdf') && viewingPdfUrl === note.file_url && (
                                        <div className="mt-4 border rounded-lg overflow-hidden bg-muted/20">
                                            <div className="flex items-center justify-between p-3 border-b bg-muted/50">
                                                <span className="text-sm font-medium">Preview PDF</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setViewingPdfUrl(null)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <iframe
                                                src={note.file_url}
                                                className="w-full border-0"
                                                style={{ height: '600px' }}
                                                title={note.file_original_name || 'PDF Viewer'}
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Multiple Attachments */}
                    {note.attachments && note.attachments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Lampiran ({note.attachments.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {note.attachments.map((attachment) => (
                                        <div key={attachment.id} className="rounded-lg border p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="uppercase">
                                                        {attachment.file_type || 'FILE'}
                                                    </Badge>
                                                    <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-xs">
                                                        {attachment.file_name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <a href={attachment.url} download target="_blank" rel="noopener noreferrer">
                                                            <ArrowLeft className="h-4 w-4 rotate-[-90deg]" />
                                                        </a>
                                                    </Button>
                                                    {isOwner && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => {
                                                                if (confirm('Hapus lampiran ini?')) {
                                                                    router.delete(`/attachments/${attachment.id}`, {
                                                                        preserveScroll: true,
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* PDF Preview Button & Inline Viewer */}
                                            {attachment.mime_type === 'application/pdf' && (
                                                <div className="mt-2">
                                                    {viewingPdfUrl !== attachment.url ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setViewingPdfUrl(attachment.url)}
                                                            className="w-full gap-2"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            Preview PDF
                                                        </Button>
                                                    ) : (
                                                        <div className="mt-2 border rounded-lg overflow-hidden bg-muted/20">
                                                            <div className="flex items-center justify-between p-2 border-b bg-muted/50">
                                                                <span className="text-xs font-medium">Preview</span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 w-6 p-0"
                                                                    onClick={() => setViewingPdfUrl(null)}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                            <iframe
                                                                src={attachment.url}
                                                                className="w-full border-0"
                                                                style={{ height: '400px' }}
                                                                title={attachment.file_name}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Image Preview */}
                                            {attachment.mime_type?.startsWith('image/') && (
                                                <div className="mt-2">
                                                    <div className="rounded-lg overflow-hidden border bg-muted/20">
                                                        <img
                                                            src={attachment.url}
                                                            alt={attachment.file_name}
                                                            className="w-full h-auto max-h-[400px] object-contain"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}        {/* Navigation */}
                    <div className="flex items-center justify-between pt-4">
                        <Button variant="outline" asChild>
                            <Link href={isOwner ? "/notes" : "/dashboard"}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {isOwner ? 'Kembali ke Daftar Catatan' : 'Kembali ke Dashboard'}
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout >
    );
}
