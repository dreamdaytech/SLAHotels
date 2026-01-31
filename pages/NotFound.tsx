
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';
import { SLAHLogo } from '../Logo';

const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-100 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -right-24 w-64 h-64 bg-amber-100 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-xl w-full relative z-10">
                <Link to="/" className="inline-block mb-12 transform hover:scale-105 transition-transform">
                    <SLAHLogo variant="dark" className="h-32 mx-auto" />
                </Link>

                <div className="bg-white rounded-[3rem] p-12 md:p-16 shadow-2xl shadow-emerald-900/5 border border-slate-100 relative overflow-hidden">
                    {/* Error Code Decoration */}
                    <div className="absolute -top-10 -right-10 opacity-[0.03] select-none">
                        <span className="text-[12rem] font-black leading-none italic">404</span>
                    </div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-50 rounded-3xl mb-8 transform -rotate-6">
                            <Search size={40} className="text-rose-500" />
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">
                            Page Not Found
                        </h1>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10">
                            The destination you're looking for doesn't exist or may have been moved. Let's get you back on the right path.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link
                                to="/"
                                className="flex items-center justify-center px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-emerald-900/20 group"
                            >
                                <Home size={16} className="mr-3 transform group-hover:-translate-y-0.5 transition-transform" />
                                Back to Home
                            </Link>
                            <Link
                                to="/contact"
                                className="flex items-center justify-center px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all group"
                            >
                                <HelpCircle size={16} className="mr-3 text-emerald-600 group-hover:rotate-12 transition-transform" />
                                Contact Support
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex items-center justify-center space-x-6 text-slate-400">
                    <Link to="/about" className="text-xs font-black uppercase tracking-widest hover:text-emerald-600 transition-colors">About Us</Link>
                    <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                    <Link to="/members" className="text-xs font-black uppercase tracking-widest hover:text-emerald-600 transition-colors">Directory</Link>
                    <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                    <Link to="/news" className="text-xs font-black uppercase tracking-widest hover:text-emerald-600 transition-colors">Updates</Link>
                </div>
            </div>

            <footer className="mt-auto py-8 text-slate-400 text-[9px] font-black uppercase tracking-[0.3em]">
                &copy; 2024 Sierra Leone Association of Hotels • Secretariat Portal
            </footer>
        </div>
    );
};

export default NotFound;
