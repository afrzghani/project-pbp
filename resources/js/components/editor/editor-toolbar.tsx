import React from 'react';
import { useEditor } from '@tiptap/react';

export default function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
    if (!editor) return null;

    const buttonClass = (active: boolean) =>
        `rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${active
            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
            : 'bg-background hover:bg-muted border-border hover:border-primary/50'
        }`;

    const handleImageUpload = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const formData = new FormData();
                formData.append('image', file);

                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                const response = await fetch('/upload/image', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken || '',
                    },
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.url) {
                        editor.chain().focus().setImage({ src: data.url }).run();
                    }
                } else {
                    alert('Gagal mengupload gambar');
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Terjadi kesalahan saat mengupload gambar');
            }
        };
        input.click();
    };

    return (
        <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-2">
            <button
                type="button"
                className={buttonClass(editor.isActive('bold'))}
                onClick={() => editor.chain().focus().toggleBold().run()}
                title="Bold (Ctrl+B)"
            >
                <strong>B</strong>
            </button>
            <button
                type="button"
                className={buttonClass(editor.isActive('italic'))}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                title="Italic (Ctrl+I)"
            >
                <em>I</em>
            </button>
            <button
                type="button"
                className={buttonClass(editor.isActive('underline'))}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                title="Underline"
            >
                <u>U</u>
            </button>
            <div className="mx-1 h-6 w-px bg-border" />
            <button
                type="button"
                className={buttonClass(editor.isActive('heading', { level: 1 }))}
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                title="Heading 1"
            >
                H1
            </button>
            <button
                type="button"
                className={buttonClass(editor.isActive('heading', { level: 2 }))}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                title="Heading 2"
            >
                H2
            </button>
            <button
                type="button"
                className={buttonClass(editor.isActive('heading', { level: 3 }))}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                title="Heading 3"
            >
                H3
            </button>
            <div className="mx-1 h-6 w-px bg-border" />
            <button
                type="button"
                className={buttonClass(editor.isActive('bulletList'))}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                title="Bullet List"
            >
                •
            </button>
            <button
                type="button"
                className={buttonClass(editor.isActive('orderedList'))}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                title="Numbered List"
            >
                1.
            </button>
            <button
                type="button"
                className={buttonClass(editor.isActive('blockquote'))}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                title="Quote"
            >
                "
            </button>
            <button
                type="button"
                className={buttonClass(editor.isActive('codeBlock'))}
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                title="Code Block"
            >
                {'</>'}
            </button>
            <div className="mx-1 h-6 w-px bg-border" />
            <button
                type="button"
                className={buttonClass(false)}
                onClick={handleImageUpload}
                title="Upload Image"
            >
                🖼️
            </button>
        </div>
    );
}
