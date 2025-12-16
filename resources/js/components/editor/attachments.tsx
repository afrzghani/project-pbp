import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { FileText, Trash2, Upload, X, Loader2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import { type NoteResource } from '@/types';

interface AttachmentsPanelProps {
    note?: NoteResource | null;
    uploadedFileName: string | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    form: any;
    pendingFiles: File[];
    setPendingFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

export default function AttachmentsPanel({
    note,
    uploadedFileName,
    onFileChange,
    form,
    pendingFiles,
    setPendingFiles,
}: AttachmentsPanelProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [attachmentToDelete, setAttachmentToDelete] = useState<{ id: number; name: string } | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        console.log('Files selected:', files);
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            const newPendingFiles = [...pendingFiles, ...fileArray];
            console.log('Setting pending files:', newPendingFiles);
            setPendingFiles(newPendingFiles);

            form.setData('files', newPendingFiles);
            form.setData('source_type', 'upload');
        }

        setTimeout(() => {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }, 100);
    };

    const removePendingFile = (index: number) => {
        const newFiles = pendingFiles.filter((_, i) => i !== index);
        setPendingFiles(newFiles);
        form.setData('files', newFiles);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleDeleteClick = (id: number, name: string) => {
        setAttachmentToDelete({ id, name });
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!attachmentToDelete) return;

        setDeleting(true);
        router.delete(`/attachments/${attachmentToDelete.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteDialogOpen(false);
                setAttachmentToDelete(null);
            },
        });
    };

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="pdf-upload"
                    multiple
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="h-4 w-4" />
                    Pilih File
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                    PDF atau gambar, maks 10MB
                </p>
            </div>

            <InputError message={form.errors.file} />
            <InputError message={form.errors.files} />

            {pendingFiles.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-xs text-amber-600 dark:text-amber-400">
                        Belum tersimpan ({pendingFiles.length})
                    </Label>
                    <div className="space-y-1.5">
                        {pendingFiles.map((file, index) => (
                            <div
                                key={`pending-${index}`}
                                className="flex items-center justify-between rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-2 text-sm"
                            >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <FileText className="h-4 w-4 text-amber-600 shrink-0" />
                                    <span className="truncate text-xs" title={file.name}>
                                        {file.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground shrink-0">
                                        {formatFileSize(file.size)}
                                    </span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                    onClick={() => removePendingFile(index)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                        Klik Simpan untuk menyimpan lampiran
                    </p>
                </div>
            )}

            {note?.attachments && note.attachments.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                        Lampiran Tersimpan ({note.attachments.length})
                    </Label>
                    <div className="space-y-1.5">
                        {note.attachments.map((attachment) => (
                            <div
                                key={attachment.id}
                                className="flex items-center justify-between rounded-lg border bg-muted/30 p-2 text-sm"
                            >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="truncate text-xs" title={attachment.file_name}>
                                        {attachment.file_name}
                                    </span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                    onClick={() => handleDeleteClick(attachment.id, attachment.file_name)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {deleteDialogOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        setDeleteDialogOpen(false);
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
                                            setDeleteDialogOpen(false);
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
                                        setDeleteDialogOpen(false);
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
        </div>
    );
}
