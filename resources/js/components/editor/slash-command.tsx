import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code, Image as ImageIcon, Table, Type, } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

const CommandList = forwardRef((props: any, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
        const item = props.items[index];
        if (item) {
            props.command(item);
        }
    };

    useEffect(() => {
        setSelectedIndex(0);
    }, [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
                return true;
            }
            if (event.key === 'ArrowDown') {
                setSelectedIndex((selectedIndex + 1) % props.items.length);
                return true;
            }
            if (event.key === 'Enter') {
                selectItem(selectedIndex);
                return true;
            }
            return false;
        },
    }));

    return (
        <div className="z-50 min-w-[200px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
            <div className="flex flex-col">
                {props.items.length ? (
                    props.items.map((item: any, index: number) => (
                        <button
                            key={index}
                            className={`flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none ${index === selectedIndex ? 'bg-accent text-accent-foreground' : ''
                                }`}
                            onClick={() => selectItem(index)}
                        >
                            <div className="flex h-5 w-5 items-center justify-center rounded border bg-background">
                                {item.icon}
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-medium text-xs">{item.title}</span>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">No results</div>
                )}
            </div>
        </div>
    );
});

CommandList.displayName = 'CommandList';

const renderItems = () => {
    let component: ReactRenderer | null = null;
    let popup: any | null = null;

    return {
        onStart: (props: any) => {
            component = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
            });

            if (!props.clientRect) {
                return;
            }

            popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
            });
        },
        onUpdate: (props: any) => {
            component?.updateProps(props);

            if (!props.clientRect) {
                return;
            }

            popup?.[0].setProps({
                getReferenceClientRect: props.clientRect,
            });
        },
        onKeyDown: (props: any) => {
            if (props.event.key === 'Escape') {
                popup?.[0].hide();
                return true;
            }
            return (component?.ref as any)?.onKeyDown(props);
        },
        onExit: () => {
            popup?.[0].destroy();
            component?.destroy();
        },
    };
};

const getSuggestionItems = ({ query }: { query: string }) => {
    return [
        {
            title: 'Text',
            icon: <Type className="h-3 w-3" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setParagraph().run();
            },
        },
        {
            title: 'Heading 1',
            icon: <Heading1 className="h-3 w-3" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
            },
        },
        {
            title: 'Heading 2',
            icon: <Heading2 className="h-3 w-3" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
            },
        },
        {
            title: 'Heading 3',
            icon: <Heading3 className="h-3 w-3" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
            },
        },
        {
            title: 'Bullet List',
            icon: <List className="h-3 w-3" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run();
            },
        },
        {
            title: 'Numbered List',
            icon: <ListOrdered className="h-3 w-3" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run();
            },
        },
        {
            title: 'Quote',
            icon: <Quote className="h-3 w-3" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setBlockquote().run();
            },
        },
        {
            title: 'Code Block',
            icon: <Code className="h-3 w-3" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setCodeBlock().run();
            },
        },
        {
            title: 'Image',
            icon: <ImageIcon className="h-3 w-3" />,
            command: ({ editor, range }: any) => {
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
                                editor.chain().focus().deleteRange(range).setImage({ src: data.url }).run();
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
            },
        },
    ].filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
};

export const SlashCommand = Extension.create({
    name: 'slashCommand',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                command: ({ editor, range, props }: any) => {
                    props.command({ editor, range });
                },
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ];
    },
});

export const slashCommandSuggestion = {
    items: getSuggestionItems,
    render: renderItems,
};
