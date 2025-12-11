import { useEffect, useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import InputError from '@/components/input-error';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import ImageExtension from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { Flame, FileText, Loader2, Save, X, Plus, Tag as TagIcon, Trash2 } from 'lucide-react';
import { type SharedData, type NoteResource, type NoteTag, type NoteAttachment } from '@/types';
import { usePage } from '@inertiajs/react';
import { SlashCommand, slashCommandSuggestion } from '@/components/editor/slash-command';
import EditorToolbar from '@/components/editor/editor-toolbar';
import AttachmentsPanel from '@/components/editor/attachments-panel';
import TagsPanel from '@/components/editor/tags-panel';


interface NoteEditorProps {
    note: NoteResource | null;
    availableTags: NoteTag[];
}

export default function NoteEditor({ note, availableTags }: NoteEditorProps) {
    const { integrations } = usePage<SharedData>().props;
    const [contentHtml, setContentHtml] = useState(note?.content_html ?? '');
    const [contentText, setContentText] = useState(note?.content_text ?? '');
    const [selectedTags, setSelectedTags] = useState<string[]>(
        note?.tags?.map((tag) => tag.name) ?? []
    );
    const [newTag, setNewTag] = useState('');
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);



    const form = useForm({
        title: note?.title ?? '',
        excerpt: note?.excerpt ?? '',
        content_html: note?.content_html ?? '',
        content_text: note?.content_text ?? '',
        status: note?.status ?? 'draft',
        visibility: note?.visibility ?? 'private',
        tags: selectedTags,
        file: null as File | null,
        files: [] as File[], // Add support for multiple files
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
            ImageExtension.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto',
                },
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
        onUpdate: ({ editor }) => {
            setContentHtml(editor.getHTML());
            setContentText(editor.getText());
        },
    });

    useEffect(() => {
        form.setData('tags', selectedTags);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTags]);

    useEffect(() => {
        form.setData('content_html', contentHtml);
        form.setData('content_text', contentText);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contentHtml, contentText]);



    useEffect(() => {
        if (note && editor) {
            const htmlContent = note.content_html ?? (note.content_text ? `<p>${note.content_text}</p>` : '');
            const textContent = note.content_text ?? editor.getText();

            // Only update if content actually changed
            if (htmlContent && htmlContent !== contentHtml) {
                editor.commands.setContent(htmlContent);
                setContentHtml(htmlContent);
                setContentText(textContent);
            }
        }
    }, [note?.id, note?.content_html, note?.content_text, editor, contentHtml]);

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

        const url = isEditing ? `/notes/${note?.id}` : '/notes';

        if (isEditing) {
            const hasFiles = (form.data.files && form.data.files.length > 0) || form.data.file !== null;

            if (hasFiles) {
                router.post(url, {
                    _method: 'put',
                    ...submitData,
                }, {
                    preserveScroll: true,
                });
            } else {
                form.transform(() => submitData);
                form.put(url, {
                    preserveScroll: true,
                });
            }
        } else {
            form.transform(() => submitData);
            form.post(url, {
                preserveScroll: true,
            });
        }
    };

    const toggleTag = (tagName: string) => {
        setSelectedTags((prev) =>
            prev.includes(tagName)
                ? prev.filter((tag) => tag !== tagName)
                : [...prev, tagName]
        );
    };

    const handleAddCustomTag = () => {
        const tag = newTag.trim();
        if (!tag) return;
        if (!selectedTags.includes(tag)) {
            setSelectedTags((prev) => [...prev, tag]);
        }
        setNewTag('');
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            // Convert FileList to array
            const fileArray = Array.from(files);
            form.setData('files', fileArray); // Use 'files' key for multiple
            form.setData('source_type', 'upload');

            if (files.length === 1) {
                setUploadedFileName(files[0].name);
            } else {
                setUploadedFileName(`${files.length} file dipilih`);
            }
        } else {
            form.setData('files', []);
            setUploadedFileName(null);
        }
    };



    const wordCount = contentText.trim().length ? contentText.trim().split(/\s+/).length : 0;

    return (
        <AppLayout breadcrumbs={[{ title: 'Catatan', href: '/notes' }, { title: isEditing ? 'Edit Catatan' : 'Catatan Baru', href: '#' }]}>
            <Head title={isEditing ? `Edit: ${note?.title}` : 'Catatan Baru'} />

            <div className="flex flex-1 flex-col">
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
                    <div className="flex items-center justify-between gap-4 p-4">
                        <div className="flex-1">
                            <h1 className="text-xl font-semibold">
                                {form.data.title || (isEditing ? 'Edit Catatan' : 'Catatan Baru')}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {isEditing ? 'Edit catatan Anda' : 'Buat catatan baru'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="uppercase">
                                {form.data.status}
                            </Badge>
                            <Badge variant="secondary" className="capitalize">
                                {form.data.visibility}
                            </Badge>
                            <Button type="button" variant="outline" size="sm" asChild>
                                <Link href="/notes">
                                    <X className="h-4 w-4 mr-2" />
                                    Batal
                                </Link>
                            </Button>
                            <Button type="submit" form="note-form" disabled={form.processing} size="sm">
                                {form.processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Simpan
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <form id="note-form" onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 p-6">
                    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 lg:flex-row">
                        {/* Main Content */}
                        <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-base font-medium">
                                    Judul Catatan
                                </Label>
                                <Input
                                    id="title"
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    placeholder="Contoh: Ringkasan Kuliah AI"
                                    className="text-lg"
                                />
                                <InputError message={form.errors.title} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-medium">Konten</Label>
                                    <span className="text-xs text-muted-foreground">
                                        {wordCount} kata
                                    </span>
                                </div>
                                <div className="rounded-lg border bg-card shadow-sm">
                                    <EditorToolbar editor={editor} />
                                    <div className="min-h-[400px]">
                                        <EditorContent
                                            editor={editor}
                                            className="ProseMirror p-4 focus-within:outline-none"
                                        />
                                    </div>
                                </div>
                                <InputError message={form.errors.content_html} />
                                <p className="text-xs text-muted-foreground">
                                    Gunakan toolbar untuk format teks. Klik area editor untuk mulai menulis.
                                </p>
                            </div>

                            {/* AI Summary Section */}
                            {note?.ai_summary && (
                                <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Flame className="h-4 w-4 text-orange-500" />
                                            Ringkasan AI
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

                        {/* Sidebar */}
                        <div className="w-full space-y-4 lg:w-80 lg:flex-shrink-0">
                            {/* Settings Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Pengaturan</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        {/* Hidden input to ensure status is sent with form data */}
                                        <input
                                            type="hidden"
                                            name="status"
                                            value={form.data.status}
                                        />
                                        <select
                                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                            value={form.data.status}
                                            onChange={(e) => form.setData('status', e.target.value)}
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Visibilitas</Label>
                                        {/* Hidden input to ensure visibility is sent with form data */}
                                        <input
                                            type="hidden"
                                            name="visibility"
                                            value={form.data.visibility}
                                        />
                                        <select
                                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                            value={form.data.visibility}
                                            onChange={(e) => form.setData('visibility', e.target.value)}
                                        >
                                            <option value="private">Private</option>
                                            <option value="public">Public</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Excerpt / Ringkasan</Label>
                                        <textarea
                                            className="min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                                            placeholder="Ringkasan singkat catatan..."
                                            value={form.data.excerpt ?? ''}
                                            onChange={(e) => form.setData('excerpt', e.target.value)}
                                        />
                                        <InputError message={form.errors.excerpt} />
                                    </div>

                                    <AttachmentsPanel
                                        note={note}
                                        uploadedFileName={uploadedFileName}
                                        onFileChange={handleFileChange}
                                        form={form}
                                    />



                                    {/* AI Processing */}
                                    <div className="flex items-center gap-2 rounded-md border p-3">
                                        <Checkbox
                                            id="process_ai"
                                            checked={form.data.process_ai}
                                            onCheckedChange={(value) => form.setData('process_ai', Boolean(value))}
                                        />
                                        <Label htmlFor="process_ai" className="flex flex-1 items-center gap-2 cursor-pointer">
                                            <Flame className="h-4 w-4 text-orange-500" />
                                            <span className="text-sm">Proses AI (ringkasan & flashcard)</span>
                                        </Label>
                                    </div>

                                    {/* AI Status */}
                                    {note?.ai_status && (
                                        <div className="rounded-md border p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    Status AI:
                                                </span>
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
                                                    className="text-xs"
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
                                </CardContent>
                            </Card>

                            {/* Tags Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <TagIcon className="h-4 w-4" />
                                        Tag
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <TagsPanel
                                        selectedTags={selectedTags}
                                        toggleTag={toggleTag}
                                        newTag={newTag}
                                        setNewTag={setNewTag}
                                        handleAddCustomTag={handleAddCustomTag}
                                        availableTags={availableTags}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
