import { home } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col p-10 text-white lg:flex">

                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-400 rounded-3xl m-4 overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:60px_60px]" />

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-white/10 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl">
                        <img src="/images/logo.png" alt="Logo" className="w-32 h-32 object-contain drop-shadow-2xl" />
                    </div>

                    <div className="absolute top-10 right-10 w-20 h-20 border border-white/20 rounded-2xl" />
                    <div className="absolute bottom-10 left-10 w-16 h-16 border border-white/20 rounded-full" />
                    <div className="absolute top-1/4 left-10 w-2 h-2 bg-white/40 rounded-full" />
                    <div className="absolute bottom-1/4 right-20 w-3 h-3 bg-white/30 rounded-full" />
                    <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-white/50 rounded-full" />
                </div>
                <Link
                    href={home()}
                    className="relative z-20 flex items-center text-2xl font-black tracking-tight"
                >
                    NoteStation.
                </Link>
                {quote && (
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">
                                &ldquo;{quote.message}&rdquo;

                            </p>
                            <footer className="text-sm text-neutral-300">
                                {quote.author}
                            </footer>
                        </blockquote>
                    </div>
                )}
            </div>

            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center gap-2 lg:hidden text-2xl font-black tracking-tight"
                    >
                        <img src="/images/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
                        NoteStation.
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
