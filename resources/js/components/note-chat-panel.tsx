import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Bot, Send, X, Loader2, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface NoteChatPanelProps {
    noteSlug: string;
    noteTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

export function NoteChatPanel({ noteSlug, noteTitle, isOpen, onClose }: NoteChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);


    const getCsrfToken = useCallback(() => {
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
    }, []);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const response = await fetch(`/api/notes/${noteSlug}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.slice(-10),
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Maaf, terjadi kesalahan. Silakan coba lagi.'
                }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Maaf, terjadi kesalahan koneksi.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] animate-in slide-in-from-bottom-5 duration-300">
            <Card className="shadow-2xl border-2">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-full">
                                <Bot className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Nora AI</CardTitle>
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    {noteTitle}
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">

                    <div className="h-[300px] overflow-y-auto p-4 space-y-3">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                                <Sparkles className="h-10 w-10 mb-3 opacity-30" />
                                <p className="text-sm font-medium">Mulai percakapan</p>
                                <p className="text-xs mt-1">Tanya apa saja tentang catatan ini</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        'flex',
                                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'max-w-[85%] rounded-2xl px-4 py-2 text-sm',
                                            msg.role === 'user'
                                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                                : 'bg-muted rounded-bl-md'
                                        )}
                                    >
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>


                    <div className="border-t p-3">
                        <div className="flex gap-2">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ketik pertanyaan..."
                                className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[40px] max-h-[100px]"
                                rows={1}
                                disabled={loading}
                                spellCheck={false}
                            />
                            <Button
                                size="icon"
                                onClick={handleSend}
                                disabled={!input.trim() || loading}
                                className="shrink-0"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 text-center">
                            AI menjawab berdasarkan konten catatan ini
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


export function AiChatFab({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
    return (
        <div className="fixed bottom-6 right-16 z-50">
            <button
                onClick={onClick}
                className={cn(
                    'relative flex items-center gap-2 px-5 py-4 rounded-full shadow-2xl transition-all duration-300',
                    'bg-gradient-to-r from-blue-600 to-blue-500 text-white',
                    'hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]',
                    'active:scale-95',
                    isOpen && 'bg-gradient-to-r from-gray-600 to-gray-700'
                )}
            >
                {isOpen ? (
                    <>
                        <X className="h-6 w-6" />
                        <span className="font-medium text-sm">Tutup</span>
                    </>
                ) : (
                    <>
                        <Bot className="h-7 w-7" />
                        <span className="font-semibold text-base">Nora AI</span>

                    </>
                )}
            </button>
        </div>
    );
}
