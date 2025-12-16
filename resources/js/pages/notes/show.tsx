import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { type BreadcrumbItem } from '@/types';
import { show as showProfile } from '@/routes/profile';
import { Edit, Trash2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Shuffle, RefreshCcw, Flame, Layers, Download, Eye, EyeOff, RotateCw, ArrowLeft, Tag as TagIcon, Heart, MessageCircle, Bookmark, FileText, X, Paperclip, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CommentSection } from '@/components/comment-section';
import { NoteChatPanel, AiChatFab } from '@/components/note-chat-panel';

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
    slug: string;
    user_id: number;
    user?: {
        id: number;
        name: string;
        avatar_url?: string | null;
        program_study?: string | null;
    } | null;
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
    isReadRoute?: boolean;
    auth?: {
        user?: {
            id: number;
        };
    };
}

export default function NoteShow({ note, isOwner = false, isReadRoute = false }: NoteShowProps) {
    const { auth } = usePage().props as { auth?: { user?: { id: number } } };

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Catatan', href: isReadRoute ? '/explore' : '/notes' }];
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
    const [commentsCount, setCommentsCount] = useState(note.comments_count ?? 0);
    const [chatOpen, setChatOpen] = useState(false);
    const [deleteAttachmentDialogOpen, setDeleteAttachmentDialogOpen] = useState(false);
    const [attachmentToDelete, setAttachmentToDelete] = useState<{ id: number; name: string } | null>(null);
    const [deletingAttachment, setDeletingAttachment] = useState(false);
    const [deleteNoteDialogOpen, setDeleteNoteDialogOpen] = useState(false);

    const isPublic = note.visibility === 'public' && note.status === 'published';
    const canInteract = isPublic && !isOwner;


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

    const flashcards = note.ai_flashcards ?? [];
    const displayFlashcards = shuffledFlashcards.length > 0 ? shuffledFlashcards : flashcards;
    const currentFlashcard = displayFlashcards[currentFlashcardIndex];

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
        setDeleteNoteDialogOpen(true);
    };

    const handleConfirmDeleteNote = () => {
        setDeleting(true);
        router.delete(`/notes/${note.slug}`, {
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
        const url = `/notes/${note.slug}/like`;
        const method = liked ? 'delete' : 'post';

        try {
            console.log('Sending like request:', { url, method });
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
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
        const url = `/notes/${note.slug}/bookmark`;
        const method = bookmarked ? 'delete' : 'post';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
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

                <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
                    <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{note.title}</h1>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                {note.tags.length > 0 && (
                                    <>
                                        {note.tags.map((tag) => (
                                            <Badge key={tag.id} className="text-xs bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-300">
                                                #{tag.name}
                                            </Badge>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {isOwner ? (
                                <>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/notes/${note.slug}/edit`}>
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
                                                className={cn("gap-1.5", liked && "bg-red-500 hover:bg-red-600 text-white border-red-500")}
                                            >
                                                <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                                                {likesCount}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="gap-1.5"
                                                asChild
                                            >
                                                <Link href={`/notes/${note.slug}#comments`}>
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
                                                className={cn("gap-1.5", bookmarked && "bg-blue-500 hover:bg-blue-600 text-white border-blue-500")}
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


                <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">

                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground sm:gap-4">

                        {!isOwner && note.user && (
                            <>
                                <Link href={showProfile({ user: note.user.id })} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={note.user.avatar_url ?? undefined} alt={note.user.name} />
                                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-medium">
                                            {note.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-foreground hover:underline">{note.user.name}</span>
                                </Link>
                                <Separator orientation="vertical" className="h-4 hidden sm:block" />
                            </>
                        )}
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm">Dibuat {new Date(note.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                            })}</span>
                        </div>
                        {note.updated_at !== note.created_at && (
                            <>
                                <Separator orientation="vertical" className="h-4 hidden sm:block" />
                                <div className="flex items-center gap-1.5">
                                    <RotateCw className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="text-xs sm:text-sm">Diperbarui {new Date(note.updated_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}</span>
                                </div>
                            </>
                        )}
                    </div>


                    <Tabs defaultValue="content" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="content" className="gap-1.5 cursor-pointer">
                                <FileText className="h-4 w-4" />
                                <span className="hidden sm:inline">Catatan</span>
                            </TabsTrigger>
                            <TabsTrigger value="attachments" className="gap-1.5 cursor-pointer">
                                <Paperclip className="h-4 w-4" />
                                <span className="hidden sm:inline">Lampiran</span>
                                <span className="text-xs">({(note.attachments?.length ?? 0) + (note.file_url && !note.attachments?.length ? 1 : 0)})</span>
                            </TabsTrigger>
                            <TabsTrigger value="comments" className="gap-1.5 cursor-pointer">
                                <MessageCircle className="h-4 w-4" />
                                <span className="hidden sm:inline">Komentar</span>
                                <span className="text-xs">({commentsCount})</span>
                            </TabsTrigger>
                        </TabsList>


                        <TabsContent value="content" className="space-y-6 mt-6">

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


                            <Card>

                                <CardContent>
                                    {note.content_html || note.content_text ? (
                                        <div
                                            className="tiptap-content prose prose-lg max-w-none dark:prose-invert overflow-auto"
                                            dangerouslySetInnerHTML={{ __html: note.content_html || `<p>${note.content_text}</p>` || '' }}
                                        />
                                    ) : (
                                        <p className="text-muted-foreground italic">Belum ada konten.</p>
                                    )}
                                </CardContent>
                            </Card>


                            {flashcards.length > 0 && (
                                <Card className="overflow-hidden">
                                    <Collapsible open={flashcardsOpen} onOpenChange={setFlashcardsOpen}>
                                        <CollapsibleTrigger asChild>
                                            <CardHeader className="cursor-pointer transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                                                            <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-lg">
                                                                Flashcard
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

                                                <p className="text-center text-xs text-muted-foreground">
                                                    Gunakan panah kiri/kanan untuk navigasi, Space/Enter untuk flip
                                                </p>

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
                        </TabsContent>


                        <TabsContent value="attachments" className="mt-6">
                            {note.attachments && note.attachments.length > 0 ? (
                                <div className="space-y-4">
                                    {note.attachments.map((attachment) => (
                                        <Card key={attachment.id}>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="uppercase">
                                                            {attachment.file_type || 'FILE'}
                                                        </Badge>
                                                        <span className="text-sm font-medium truncate max-w-[150px] md:max-w-xs">
                                                            {attachment.file_name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <a href={attachment.url} download target="_blank" rel="noopener noreferrer">
                                                                <Download className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                        {isOwner && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                onClick={() => {
                                                                    setAttachmentToDelete({ id: attachment.id, name: attachment.file_name });
                                                                    setDeleteAttachmentDialogOpen(true);
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>


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
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : note.file_url ? (
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3 mb-4">
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
                                            <Button variant="outline" asChild>
                                                <a href={note.file_url} download target="_blank" rel="noopener noreferrer">
                                                    Download
                                                </a>
                                            </Button>
                                        </div>
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
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="p-8 text-center text-muted-foreground">
                                        <Paperclip className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                        <p>Tidak ada lampiran</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>


                        <TabsContent value="comments" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageCircle className="h-5 w-5" />
                                        Komentar
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CommentSection
                                        noteSlug={note.slug}
                                        noteId={note.id}
                                        currentUserId={auth?.user?.id}
                                        noteOwnerId={note.user_id}
                                        canComment={isPublic || isOwner}
                                        onCountChange={setCommentsCount}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

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

            <AiChatFab onClick={() => setChatOpen(!chatOpen)} isOpen={chatOpen} />
            <NoteChatPanel
                noteSlug={note.slug}
                noteTitle={note.title}
                isOpen={chatOpen}
                onClose={() => setChatOpen(false)}
            />

            {deleteAttachmentDialogOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        setDeleteAttachmentDialogOpen(false);
                    }}
                >
                    <div
                        className="relative w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden">
                            <div className="relative bg-white dark:bg-neutral-800 p-6 text-black dark:text-white">
                                <div className="absolute top-3 right-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteAttachmentDialogOpen(false);
                                        }}
                                        className="rounded-full p-1.5 hover:bg-neutral-200/40 dark:hover:bg-neutral-700/30 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div>
                                        <h3 className="text-xl font-bold">Hapus Lampiran?</h3>
                                        <p className="text-sm text-muted-foreground">Lampiran akan dihapus secara permanen</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-2">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Apakah kamu yakin ingin menghapus lampiran berikut?
                                    </p>
                                    <p className="font-semibold text-base bg-muted/50 rounded-lg p-3 border border-border/50 truncate">
                                        {attachmentToDelete?.name}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-muted/30 px-6 py-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                                <Button
                                    variant="outline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteAttachmentDialogOpen(false);
                                    }}
                                    className="w-full sm:w-auto"
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!attachmentToDelete) return;
                                        setDeletingAttachment(true);
                                        router.delete(`/attachments/${attachmentToDelete.id}`, {
                                            preserveScroll: true,
                                            onFinish: () => {
                                                setDeletingAttachment(false);
                                                setDeleteAttachmentDialogOpen(false);
                                                setAttachmentToDelete(null);
                                            },
                                        });
                                    }}
                                    disabled={deletingAttachment}
                                    className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                                >
                                    {deletingAttachment ? (
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

            {deleteNoteDialogOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        setDeleteNoteDialogOpen(false);
                    }}
                >
                    <div
                        className="relative w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden">
                            <div className="relative bg-white dark:bg-neutral-800 p-6 text-black dark:text-white">
                                <div className="absolute top-3 right-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteNoteDialogOpen(false);
                                        }}
                                        className="rounded-full p-1.5 hover:bg-neutral-200/40 dark:hover:bg-neutral-700/30 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div>
                                        <h3 className="text-xl font-bold">Hapus Catatan?</h3>
                                        <p className="text-sm text-muted-foreground">Catatan akan dihapus secara permanen</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-2">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Apakah kamu yakin ingin menghapus catatan berikut?
                                    </p>
                                    <p className="font-semibold text-base bg-muted/50 rounded-lg p-3 border border-border/50">
                                        {note.title}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-muted/30 px-6 py-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                                <Button
                                    variant="outline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteNoteDialogOpen(false);
                                    }}
                                    className="w-full sm:w-auto"
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleConfirmDeleteNote();
                                    }}
                                    disabled={deleting}
                                    className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                                >
                                    {deleting ? (
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
        </AppLayout >
    );
}

