import React from 'react';
import { useEditor } from '@tiptap/react';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Code,
    ImageIcon,
    Undo,
    Redo,
    Highlighter,
    Minus,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                "p-2 rounded-lg transition-all duration-200 ease-out",
                "hover:bg-accent/80 hover:text-accent-foreground",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                "disabled:opacity-40 disabled:pointer-events-none",
                "active:scale-95",
                isActive && "bg-primary/10 text-primary shadow-sm border border-primary/20"
            )}
        >
            {children}
        </button>
    );
}

function ToolbarDivider() {
    return <div className="w-px h-5 bg-border/60 mx-1.5" />;
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-0.5 bg-muted/40 rounded-lg p-0.5">
            {children}
        </div>
    );
}

export default function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
    if (!editor) return null;

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

                const response = await fetch('/upload/image', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'X-XSRF-TOKEN': getCsrfToken(),
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.url) {
                        editor.chain().focus().setImage({ src: data.url }).run();
                    }
                } else {
                    console.error('Upload failed:', response.status, response.statusText);
                    alert('Gagal mengupload gambar');
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Terjadi kesalahan saat mengupload gambar');
            }
        };
        input.click();
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Masukkan URL:', previousUrl);

        if (url === null) return;

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const iconSize = 16;

    return (
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b bg-gradient-to-b from-background to-background/95 backdrop-blur-sm p-3">

            <ToolbarGroup>
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Undo (Ctrl+Z)"
                >
                    <Undo size={iconSize} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Redo (Ctrl+Y)"
                >
                    <Redo size={iconSize} />
                </ToolbarButton>
            </ToolbarGroup>

            <ToolbarDivider />


            <ToolbarGroup>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Bold (Ctrl+B)"
                >
                    <Bold size={iconSize} strokeWidth={2.5} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Italic (Ctrl+I)"
                >
                    <Italic size={iconSize} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    title="Underline (Ctrl+U)"
                >
                    <UnderlineIcon size={iconSize} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    isActive={editor.isActive('highlight')}
                    title="Highlight"
                >
                    <Highlighter size={iconSize} />
                </ToolbarButton>
            </ToolbarGroup>

            <ToolbarDivider />


            <ToolbarGroup>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 size={iconSize} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 size={iconSize} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                >
                    <Heading3 size={iconSize} />
                </ToolbarButton>
            </ToolbarGroup>

            <ToolbarDivider />


            <ToolbarGroup>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <List size={iconSize} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Numbered List"
                >
                    <ListOrdered size={iconSize} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    title="Quote"
                >
                    <Quote size={iconSize} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive('codeBlock')}
                    title="Code Block"
                >
                    <Code size={iconSize} />
                </ToolbarButton>
            </ToolbarGroup>

            <ToolbarDivider />


            <ToolbarGroup>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    isActive={editor.isActive({ textAlign: 'left' })}
                    title="Align Left"
                >
                    <AlignLeft size={iconSize} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    isActive={editor.isActive({ textAlign: 'center' })}
                    title="Align Center"
                >
                    <AlignCenter size={iconSize} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    isActive={editor.isActive({ textAlign: 'right' })}
                    title="Align Right"
                >
                    <AlignRight size={iconSize} />
                </ToolbarButton>
            </ToolbarGroup>

            <ToolbarDivider />


            <ToolbarGroup>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Horizontal Line"
                >
                    <Minus size={iconSize} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={handleImageUpload}
                    title="Upload Image"
                >
                    <ImageIcon size={iconSize} />
                </ToolbarButton>
            </ToolbarGroup>
        </div>
    );
}
