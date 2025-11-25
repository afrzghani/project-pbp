import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
    ChevronLeft,
    ChevronRight,
    RefreshCcw,
    Shuffle,
} from 'lucide-react';

interface Flashcard {
    question: string;
    answer: string;
}

interface FlashcardNote {
    id: number;
    title: string;
    ai_completed_at?: string | null;
    program_study?: {
        id: number;
        nama: string;
    } | null;
    flashcards: Flashcard[];
}

interface FlashcardsPageProps {
    notes: FlashcardNote[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Flashcard', href: '/flashcards' },
];

export default function FlashcardsPage({ notes }: FlashcardsPageProps) {
    const [selectedNoteId, setSelectedNoteId] = useState<number | null>(
        notes[0]?.id ?? null,
    );
    const [deck, setDeck] = useState<Flashcard[]>(
        notes[0]?.flashcards ?? [],
    );
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const activeNote = useMemo(
        () =>
            notes.find((note) => note.id === selectedNoteId) ??
            notes[0] ??
            null,
        [notes, selectedNoteId],
    );

    useEffect(() => {
        const timer = window.setTimeout(() => {
            if (activeNote) {
                setDeck(activeNote.flashcards);
                setCurrentIndex(0);
                setIsFlipped(false);
            } else {
                setDeck([]);
            }
        }, 0);

        return () => window.clearTimeout(timer);
    }, [activeNote]);

    const activeCard = deck[currentIndex];

    const handlePrev = () => {
        if (deck.length === 0) return;
        setCurrentIndex(
            (prev) => (prev - 1 + deck.length) % deck.length,
        );
        setIsFlipped(false);
    };

    const handleNext = () => {
        if (deck.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % deck.length);
        setIsFlipped(false);
    };

    const handleShuffle = () => {
        if (!activeNote) return;
        const shuffled = [...activeNote.flashcards];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setDeck(shuffled);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const handleResetOrder = () => {
        if (!activeNote) return;
        setDeck(activeNote.flashcards);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const handleFlip = () => {
        if (!activeCard) return;
        setIsFlipped((prev) => !prev);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Flashcard" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Flashcard</h1>
                        <p className="text-sm text-muted-foreground">
                            Latihan dari ringkasan catatan Anda. Klik kartu
                            untuk menampilkan jawaban.
                        </p>
                    </div>
                    {notes.length > 0 && (
                        <div className="w-full max-w-sm">
                            <Select
                                value={
                                    selectedNoteId
                                        ? String(selectedNoteId)
                                        : undefined
                                }
                                onValueChange={(value) =>
                                    setSelectedNoteId(Number(value))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih catatan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {notes.map((note) => (
                                        <SelectItem
                                            key={note.id}
                                            value={String(note.id)}
                                        >
                                            <span className="flex flex-col text-start">
                                                {note.title}
                                                {note.program_study?.nama && (
                                                    <small className="text-xs text-muted-foreground">
                                                        {
                                                            note.program_study
                                                                .nama
                                                        }
                                                    </small>
                                                )}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </header>

                {notes.length === 0 ? (
                    <EmptyState />
                ) : deck.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex min-h-[300px] flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                            <p>
                                Catatan ini belum memiliki flashcard AI.
                                Tambahkan catatan lain atau proses ulang.
                            </p>
                            <Button
                                variant="outline"
                                onClick={handleResetOrder}
                            >
                                Muat Ulang
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <section className="grid gap-6 lg:grid-cols-[3fr_1fr]">
                        <div className="space-y-4">
                            <FlashcardViewer
                                card={activeCard}
                                currentIndex={currentIndex}
                                total={deck.length}
                                isFlipped={isFlipped}
                                onFlip={handleFlip}
                            />

                            <Controls
                                onPrev={handlePrev}
                                onNext={handleNext}
                                onShuffle={handleShuffle}
                                onReset={handleResetOrder}
                                disableNav={deck.length === 0}
                            />
                        </div>

                        <Card className="h-fit">
                            <CardHeader>
                                <CardTitle>Info Catatan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">
                                        Judul
                                    </p>
                                    <p className="font-medium">
                                        {activeNote?.title}
                                    </p>
                                </div>
                                {activeNote?.program_study?.nama && (
                                    <div>
                                        <p className="text-muted-foreground">
                                            Program Studi
                                        </p>
                                        <p className="font-medium">
                                            {activeNote.program_study.nama}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-muted-foreground">
                                        Flashcard siap
                                    </p>
                                    <p className="font-medium">
                                        {deck.length} kartu
                                    </p>
                                </div>
                                {activeNote?.ai_completed_at && (
                                    <div>
                                        <p className="text-muted-foreground">
                                            Diproses AI
                                        </p>
                                        <p className="font-medium">
                                            {new Date(
                                                activeNote.ai_completed_at,
                                            ).toLocaleString('id-ID', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            })}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </section>
                )}
            </div>
        </AppLayout>
    );
}

function FlashcardViewer({
    card,
    currentIndex,
    total,
    isFlipped,
    onFlip,
}: {
    card?: Flashcard;
    currentIndex: number;
    total: number;
    isFlipped: boolean;
    onFlip: () => void;
}) {
    if (!card) {
        return null;
    }

    return (
        <Card
            className={cn(
                'min-h-[320px] cursor-pointer border-primary/30 transition-all',
                isFlipped && 'bg-primary text-primary-foreground',
            )}
            onClick={onFlip}
        >
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                    Kartu {currentIndex + 1} / {total}
                </CardTitle>
                <Badge variant={isFlipped ? 'secondary' : 'outline'}>
                    {isFlipped ? 'Jawaban' : 'Pertanyaan'}
                </Badge>
            </CardHeader>
            <CardContent className="flex h-full min-h-[220px] items-center justify-center text-center text-lg leading-relaxed">
                {isFlipped ? card.answer : card.question}
            </CardContent>
        </Card>
    );
}

function Controls({
    onPrev,
    onNext,
    onShuffle,
    onReset,
    disableNav,
}: {
    onPrev: () => void;
    onNext: () => void;
    onShuffle: () => void;
    onReset: () => void;
    disableNav: boolean;
}) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <Button
                variant="outline"
                onClick={onPrev}
                disabled={disableNav}
            >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Sebelumnya
            </Button>
            <Button
                variant="outline"
                onClick={onNext}
                disabled={disableNav}
            >
                Berikutnya
                <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
                variant="secondary"
                onClick={onShuffle}
                disabled={disableNav}
            >
                <Shuffle className="mr-2 h-4 w-4" />
                Acak
            </Button>
            <Button
                variant="ghost"
                onClick={onReset}
                disabled={disableNav}
            >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reset Urutan
            </Button>
        </div>
    );
}

function EmptyState() {
    return (
        <Card className="border-dashed">
            <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-center">
                <p className="text-lg font-semibold">
                    Belum ada flashcard AI.
                </p>
                <p className="max-w-md text-sm text-muted-foreground">
                    Buat catatan dan centang opsi <b>Proses AI</b> saat
                    menyimpan. Setelah ringkasan selesai, flashcard akan
                    muncul di sini.
                </p>
                <Button asChild>
                    <Link href="/notes/create">Buat Catatan</Link>
                </Button>
            </CardContent>
        </Card>
    );
}

