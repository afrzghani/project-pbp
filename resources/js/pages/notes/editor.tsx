import { useEffect, useState, useCallback, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import ImageResize from 'tiptap-extension-resize-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
    Flame,
    Loader2,
    Save,
    X,
    Tag as TagIcon,
    ChevronLeft,
    Check,
    Clock,
    Settings,
    FileText,
    Upload
} from 'lucide-react';
import { type SharedData, type NoteResource, type NoteTag, type NoteAttachment } from '@/types';
import { usePage } from '@inertiajs/react';
import { SlashCommand, slashCommandSuggestion } from '@/components/editor/slash-command';
import EditorToolbar from '@/components/editor/editor-toolbar';
import AttachmentsPanel from '@/components/editor/attachments';
import TagsPanel from '@/components/editor/tags';
import { cn } from '@/lib/utils';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

interface NoteEditorProps {
    note: NoteResource | null;
    availableTags: NoteTag[];
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function NoteEditor({ note, availableTags }: NoteEditorProps) {
    const { integrations } = usePage<SharedData>().props;
    const [contentHtml, setContentHtml] = useState(note?.content_html ?? '');
    const [contentText, setContentText] = useState(note?.content_text ?? '');
    const [selectedTags, setSelectedTags] = useState<string[]>(
        note?.tags?.map((tag) => tag.name) ?? []
    );
    const [newTag, setNewTag] = useState('');
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [isFullscreen] = useState(false);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const hasUnsavedChanges = useRef(false);

    const form = useForm({
        title: note?.title ?? '',
        excerpt: note?.excerpt ?? '',
        content_html: note?.content_html ?? '',
        content_text: note?.content_text ?? '',
        status: note?.status ?? 'draft',
        visibility: note?.visibility ?? 'private',
        tags: selectedTags,
        file: null as File | null,
        files: [] as File[],
        source_type: note?.source_type ?? 'manual',
        process_ai: false,
    });

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Highlight,
            LinkExtension.configure({ openOnClick: false }),
            Placeholder.configure({ placeholder: 'Mulai menulis catatan Anda… (Ketik "/" untuk perintah)' }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            ImageResize.configure({
                allowBase64: true,
            }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            SlashCommand.configure({
                suggestion: slashCommandSuggestion,
            }),
        ],
        content: note?.content_html ?? '',
        editable: true,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            setContentHtml(editor.getHTML());
            setContentText(editor.getText());
            hasUnsavedChanges.current = true;
        },
    });


    const autoSave = useCallback(() => {
        if (!hasUnsavedChanges.current || !form.data.title.trim()) return;
        if (!note) return;

        setSaveStatus('saving');

        const submitData = {
            ...form.data,
            content_html: contentHtml,
            content_text: contentText,
            tags: selectedTags,
        };

        router.put(`/notes/${note.slug}`, submitData, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setSaveStatus('saved');
                setLastSaved(new Date());
                hasUnsavedChanges.current = false;
                setTimeout(() => setSaveStatus('idle'), 2000);
            },
            onError: () => {
                setSaveStatus('error');
                setTimeout(() => setSaveStatus('idle'), 3000);
            },
        });
    }, [note, form.data, contentHtml, contentText, selectedTags]);

    useEffect(() => {
        if (!note) return;

        if (autoSaveTimerRef.current) {
            clearInterval(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setInterval(() => {
            if (hasUnsavedChanges.current) {
                autoSave();
            }
        }, 30000);

        return () => {
            if (autoSaveTimerRef.current) {
                clearInterval(autoSaveTimerRef.current);
            }
        };
    }, [note, autoSave]);

    useEffect(() => {
        form.setData(prevData => ({
            ...prevData,
            tags: selectedTags,
        }));
    }, [selectedTags]);

    useEffect(() => {
        form.setData(prevData => ({
            ...prevData,
            content_html: contentHtml,
            content_text: contentText,
        }));
    }, [contentHtml, contentText]);

    useEffect(() => {
        if (note && editor && !editor.isDestroyed) {
            const htmlContent = note.content_html ?? (note.content_text ? `<p>${note.content_text}</p>` : '');

            if (editor.isEmpty || editor.getHTML() === '<p></p>') {
                editor.commands.setContent(htmlContent);
                setContentHtml(htmlContent);
                setContentText(note.content_text ?? '');
            }
        }
    }, [note?.id, editor]);

    const isEditing = Boolean(note);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const currentStatus = form.data.status || note?.status || 'draft';
        const currentVisibility = form.data.visibility || note?.visibility || 'private';

        const submitData = {
            ...form.data,
            content_html: contentHtml,
            content_text: contentText,
            tags: selectedTags,
            status: currentStatus,
            visibility: currentVisibility,
        };

        const url = isEditing ? `/notes/${note?.slug}` : '/notes';

        setSaveStatus('saving');

        const handleSuccess = () => {
            setSaveStatus('saved');
            hasUnsavedChanges.current = false;
            setTimeout(() => {
                router.visit('/notes', {
                    preserveState: false,
                });
            }, 800);
        };

        const handleError = () => {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        };

        if (isEditing) {
            const hasFiles = (form.data.files && form.data.files.length > 0) || form.data.file !== null;

            if (hasFiles) {
                router.post(url, {
                    _method: 'put',
                    ...submitData,
                }, {
                    preserveScroll: true,
                    onSuccess: handleSuccess,
                    onError: handleError,
                });
            } else {
                form.transform(() => submitData);
                form.put(url, {
                    preserveScroll: true,
                    onSuccess: handleSuccess,
                    onError: handleError,
                });
            }
        } else {
            form.transform(() => submitData);
            form.post(url, {
                preserveScroll: true,
                onSuccess: handleSuccess,
                onError: handleError,
            });
        }
    };

    const toggleTag = (tagName: string) => {
        setSelectedTags((prev) =>
            prev.includes(tagName)
                ? prev.filter((tag) => tag !== tagName)
                : [...prev, tagName]
        );
        hasUnsavedChanges.current = true;
    };

    const handleAddCustomTag = () => {
        const tag = newTag.trim();
        if (!tag) return;
        if (!selectedTags.includes(tag)) {
            setSelectedTags((prev) => [...prev, tag]);
            hasUnsavedChanges.current = true;
        }
        setNewTag('');
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            form.setData('files', fileArray);
            form.setData('source_type', 'upload');

            if (files.length === 1) {
                setUploadedFileName(files[0].name);
            } else {
                setUploadedFileName(`${files.length} file dipilih`);
            }
            hasUnsavedChanges.current = true;
        } else {
            form.setData('files', []);
            setUploadedFileName(null);
        }
    };

    const wordCount = contentText.trim().length ? contentText.trim().split(/\s+/).length : 0;
    const charCount = contentText.length;

    const getSaveStatusDisplay = () => {
        switch (saveStatus) {
            case 'saving':
                return (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Menyimpan...</span>
                    </div>
                );
            case 'saved':
                return (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <Check className="h-4 w-4" />
                        <span className="text-sm">Tersimpan!</span>
                    </div>
                );
            case 'error':
                return (
                    <div className="flex items-center gap-2 text-destructive">
                        <X className="h-4 w-4" />
                        <span className="text-sm">Gagal menyimpan</span>
                    </div>
                );
            default:
                if (lastSaved) {
                    return (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">
                                Terakhir disimpan: {lastSaved.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                }
                return null;
        }
    };

    const settingsContent = (
        <div className="space-y-5">
            <div className="rounded-xl border bg-background p-4 space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pengaturan Publikasi</h4>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label className="text-xs">Status</Label>
                        <select
                            className="w-full rounded-lg border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            value={form.data.status}
                            onChange={(e) => {
                                form.setData('status', e.target.value);
                                hasUnsavedChanges.current = true;
                            }}
                        >
                            <option value="draft">Draf</option>
                            <option value="published">Publikasi</option>
                            <option value="archived">Arsip</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs">Visibilitas</Label>
                        <select
                            className="w-full rounded-lg border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            value={form.data.visibility}
                            onChange={(e) => {
                                form.setData('visibility', e.target.value);
                                hasUnsavedChanges.current = true;
                            }}
                        >
                            <option value="private">Privat</option>
                            <option value="public">Publik</option>
                        </select>
                    </div>
                </div>
            </div>


            <div className="rounded-xl border bg-background p-4 space-y-3">
                <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Upload className="h-3.5 w-3.5" />
                    Lampiran
                </Label>
                <AttachmentsPanel
                    note={note}
                    uploadedFileName={uploadedFileName}
                    onFileChange={handleFileChange}
                    form={form}
                    pendingFiles={pendingFiles}
                    setPendingFiles={setPendingFiles}
                />
            </div>


            <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30 p-4">
                <div className="flex items-start gap-3">
                    <Checkbox
                        id="process_ai"
                        checked={form.data.process_ai}
                        onCheckedChange={(value) => form.setData('process_ai', Boolean(value))}
                        className="mt-0.5 border-blue-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <Label htmlFor="process_ai" className="flex-1 cursor-pointer space-y-1">
                        <div className="flex items-center gap-2">
                            <Flame className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-sm">Generate Flashcard</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Generate ringkasan & flashcard otomatis</p>
                    </Label>
                </div>
            </div>

            {note?.ai_status && (
                <div className="rounded-xl border bg-background p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status AI</span>
                        <Badge
                            variant={
                                note.ai_status === 'completed'
                                    ? 'default'
                                    : note.ai_status === 'processing' || note.ai_status === 'queued'
                                        ? 'secondary'
                                        : note.ai_status === 'failed'
                                            ? 'destructive'
                                            : 'outline'
                            }
                        >
                            {note.ai_status === 'completed' && 'Selesai'}
                            {note.ai_status === 'processing' && 'Memproses...'}
                            {note.ai_status === 'queued' && 'Antrian'}
                            {note.ai_status === 'failed' && 'Gagal'}
                        </Badge>
                    </div>
                    {note.ai_completed_at && (
                        <p className="text-xs text-muted-foreground">
                            Selesai: {new Date(note.ai_completed_at).toLocaleString('id-ID')}
                        </p>
                    )}
                </div>
            )}


            <div className="rounded-xl border bg-background p-4 space-y-3">
                <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <TagIcon className="h-3.5 w-3.5" />
                    Tags
                </Label>
                <TagsPanel
                    selectedTags={selectedTags}
                    toggleTag={toggleTag}
                    newTag={newTag}
                    setNewTag={setNewTag}
                    handleAddCustomTag={handleAddCustomTag}
                    availableTags={availableTags}
                />
            </div>
        </div>
    );

    return (
        <>
            <Head title={isEditing ? `Edit: ${note?.title || 'Catatan'}` : 'Catatan Baru'} />

            <div className={cn(
                "flex flex-col bg-background transition-all duration-300",
                isFullscreen ? "fixed inset-0 z-50" : "min-h-screen"
            )}>
                <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
                    <div className="flex items-center justify-between gap-4 px-4 h-14">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="shrink-0"
                            >
                                <Link href="/notes">
                                    <ChevronLeft className="h-5 w-5" />
                                </Link>
                            </Button>

                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                                <Input
                                    value={form.data.title}
                                    onChange={(e) => {
                                        form.setData('title', e.target.value);
                                        hasUnsavedChanges.current = true;
                                    }}
                                    placeholder="Judul catatan..."
                                    className="text-lg font-semibold border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <div className="hidden sm:block">
                                {saveStatus === 'idle' && lastSaved && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span className="text-sm">
                                            Terakhir disimpan: {lastSaved.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <Button
                                type="submit"
                                form="note-form"
                                disabled={form.processing || saveStatus === 'saving'}
                                className="gap-2"
                            >
                                {saveStatus === 'saving' ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="hidden sm:inline">Menyimpan...</span>
                                    </>
                                ) : saveStatus === 'saved' ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        <span className="hidden sm:inline">Tersimpan!</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        <span className="hidden sm:inline">Simpan</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </header>

                <form id="note-form" onSubmit={handleSubmit} className="flex-1 flex overflow-hidden">
                    <div className="flex flex-1 gap-0">
                        <div className="flex-1 flex flex-col overflow-y-auto">
                            <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-6">
                                {form.errors.title && (
                                    <div className="mb-4">
                                        <InputError message={form.errors.title} />
                                    </div>
                                )}

                                <div className="rounded-2xl border border-border/50 bg-card shadow-lg shadow-black/5 dark:shadow-black/20 overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
                                    {editor ? (
                                        <>
                                            <EditorToolbar editor={editor} />

                                            <div className={cn(
                                                "transition-all duration-300 bg-background",
                                                isFullscreen ? "min-h-[calc(100vh-180px)]" : "min-h-[500px]"
                                            )}>
                                                <EditorContent
                                                    editor={editor}
                                                    className="px-8 py-6 [&_.ProseMirror]:min-h-[450px] [&_.ProseMirror]:outline-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:text-foreground [&_.ProseMirror]:leading-relaxed [&_.ProseMirror]:text-base"
                                                    spellCheck={false}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center min-h-[500px] bg-muted/20">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
                                                <span className="text-sm text-muted-foreground">Memuat editor...</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between border-t border-border/50 px-6 py-3 bg-muted/20 text-sm">
                                        <div className="flex items-center gap-6 text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <span className="font-medium text-foreground">{wordCount}</span> kata
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="font-medium text-foreground">{charCount}</span> karakter
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            {selectedTags.length > 0 && (
                                                <span className="flex items-center gap-1.5">
                                                    <TagIcon className="h-3.5 w-3.5" />
                                                    <span className="font-medium text-foreground">{selectedTags.length}</span> tag
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {note?.ai_summary && (
                                    <Card className="mt-6 border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <Flame className="h-4 w-4 text-orange-500" />
                                                Ringkasan Catatan
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm leading-relaxed text-foreground">
                                                {note.ai_summary}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>


                        <aside className="hidden lg:block w-80 border-l border-border/50 bg-muted/20 overflow-y-auto">
                            <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/50 px-5 py-4">
                                <h3 className="font-semibold flex items-center gap-2.5 text-sm">
                                    <div className="p-1.5 rounded-md bg-primary/10">
                                        <Settings className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    Pengaturan Catatan
                                </h3>
                            </div>
                            <div className="p-5">
                                {settingsContent}
                            </div>
                        </aside>

                        {/* Mobile: Settings*/}
                        <div className="lg:hidden fixed bottom-4 right-4 z-50">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
                                        <Settings className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="overflow-y-auto px-5">
                                    <SheetHeader>
                                        <SheetTitle>Pengaturan Catatan</SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-6 pb-8">
                                        {settingsContent}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
