import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { FileText, Trash2, Upload } from 'lucide-react';
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
                                    onClick={() => {
                                        if (confirm('Hapus lampiran ini?')) {
                                            router.delete(`/attachments/${attachment.id}`, {
                                                preserveScroll: true,
                                            });
                                        }
                                    }}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
