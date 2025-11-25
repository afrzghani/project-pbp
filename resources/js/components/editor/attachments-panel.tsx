import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import InputError from '@/components/input-error';
import { FileText, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import { type NoteResource } from '@/types';

export default function AttachmentsPanel({
    note,
    uploadedFileName,
    onFileChange,
    form,
}: {
    note?: NoteResource | null;
    uploadedFileName: string | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    form: any;
}) {
    return (
        <div className="space-y-2">
            <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Upload PDF
            </Label>

            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={onFileChange}
                        className="hidden"
                        id="pdf-upload"
                        multiple // Allow multiple files
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => document.getElementById('pdf-upload')?.click()}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        {uploadedFileName || (note?.file_original_name ? 'Ganti File' : 'Pilih File')}
                    </Button>
                </div>

                {(uploadedFileName || note?.file_original_name) && (
                    <div className="rounded-md border bg-muted/50 p-2 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="truncate font-medium">
                                {uploadedFileName || note?.file_original_name}
                            </span>
                            <Badge variant="secondary" className="ml-2">
                                Lampiran
                            </Badge>
                        </div>
                    </div>
                )}
            </div>

            <InputError message={form.errors.file} />
            <p className="text-xs text-muted-foreground">
                Upload file PDF atau gambar sebagai lampiran catatan.
            </p>

            {/* Existing Attachments List */}
            {note?.attachments && note.attachments.length > 0 && (
                <div className="space-y-3 pt-2">
                    <Label>Lampiran Tersimpan ({note.attachments.length})</Label>
                    <div className="space-y-2">
                        {note.attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                                <div className="flex items-center gap-2 truncate">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="truncate max-w-[150px]" title={attachment.file_name}>
                                        {attachment.file_name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
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
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
