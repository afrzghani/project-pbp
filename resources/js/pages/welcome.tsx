import { dashboard, login, register } from '@/routes';
import { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Brain,
    Cloud,
    FileText,
    MessageCircle,
    Trophy,
    Zap,
} from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-300 text-white font-sans selection:bg-blue-800 selection:text-white overflow-x-hidden">
                {/* Navbar */}
                <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
                    <div className="flex items-center gap-8">
                        <div className="text-2xl font-black tracking-tight">NoteStation.</div>
                    </div>
                    <div className="flex items-center gap-4">
                        {auth.user ? (
                            <Link href={dashboard()} className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={login()} className="px-4 py-2 text-white hover:text-blue-100 font-medium transition">
                                    Masuk
                                </Link>
                                <Link href={register()} className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition">
                                    Daftar
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-6 pt-10 pb-20 flex flex-col items-center relative">

                    <div className="text-center mb-12 z-10">
                        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-4">NoteStation.</h1>
                        <p className="text-xl md:text-2xl text-blue-50 font-light">Buka Potensi Akademikmu.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full items-center">

                        <div className="lg:col-span-3 flex flex-col gap-8 order-2 lg:order-1">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">Atur &<br />Sintesis</h3>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <MessageCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">Kolaborasi<br />& Berbagi</h3>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <Cloud className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">Akses Dimana Saja,<br />Kapan Saja</h3>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-6 relative order-1 lg:order-2">
                            <div className="relative z-10">

                                <div className="bg-gray-900 rounded-xl shadow-2xl border-4 border-gray-800 aspect-[16/10] flex items-center justify-center overflow-hidden relative">
                                    <div className="absolute top-0 w-full h-6 bg-gray-800 flex items-center px-4 gap-1">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="w-full h-full bg-white mt-6 p-4 text-gray-800 overflow-hidden">
                                        <div className="flex gap-4 h-full">
                                            <div className="w-1/4 bg-gray-100 rounded-lg p-2 space-y-2">
                                                <div className="h-2 w-1/2 bg-gray-300 rounded"></div>
                                                <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
                                                <div className="h-2 w-full bg-gray-200 rounded"></div>
                                            </div>
                                            <div className="w-3/4 space-y-4">
                                                <div className="flex justify-between">
                                                    <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                                                    <div className="h-8 w-24 bg-blue-500 rounded-md"></div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="h-32 bg-blue-50 rounded-lg border border-blue-100 p-2"></div>
                                                    <div className="h-32 bg-blue-50 rounded-lg border border-blue-100 p-2"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -right-4 -bottom-8 w-1/4 aspect-[9/19] bg-gray-900 rounded-[2rem] border-4 border-gray-800 shadow-2xl overflow-hidden">
                                    <div className="w-full h-full bg-white p-2 text-gray-800 flex flex-col">
                                        <div className="h-4 w-full bg-gray-100 mb-2 rounded"></div>
                                        <div className="flex-1 bg-blue-50 rounded-lg border border-blue-100"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-400/30 blur-3xl rounded-full -z-10"></div>
                        </div>

                        <div className="lg:col-span-3 flex flex-col items-center lg:items-start gap-4 order-3">
                            <Link href={register()} className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-8 py-3 rounded-full font-semibold text-lg transition shadow-lg border border-white/20 w-full text-center lg:w-auto">
                                Daftar Gratis
                            </Link>
                            <p className="text-sm text-blue-100">Dipercaya oleh mahasiswa di seluruh dunia.</p>
                        </div>
                    </div>

                </main>

                <section className="max-w-5xl mx-auto px-6 pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/10 hover:bg-white/15 transition group">
                            <div className="flex justify-center mb-4">
                                <Zap className="w-8 h-8 text-blue-200 group-hover:text-white transition" />
                            </div>
                            <h3 className="font-bold mb-2">Ringkasan AI</h3>
                            <p className="text-sm text-blue-100">Pahami catatan panjang dalam hitungan detik dengan ringkasan cerdas.</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/10 hover:bg-white/15 transition group">
                            <div className="flex justify-center mb-4">
                                <FileText className="w-8 h-8 text-blue-200 group-hover:text-white transition" />
                            </div>
                            <h3 className="font-bold mb-2">Flashcard Otomatis</h3>
                            <p className="text-sm text-blue-100">Ubah catatan menjadi alat belajar efektif secara instan.</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/10 hover:bg-white/15 transition group">
                            <div className="flex justify-center mb-4">
                                <Trophy className="w-8 h-8 text-blue-200 group-hover:text-white transition" />
                            </div>
                            <h3 className="font-bold mb-2">Leaderboard Kampus</h3>
                            <p className="text-sm text-blue-100">Bersaing menjadi yang terbaik di kampusmu dengan kontribusi catatan.</p>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
