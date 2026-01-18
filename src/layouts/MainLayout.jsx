import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-300">
            <Sidebar />
            <main className="flex-1 h-screen overflow-hidden flex flex-col relative bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-0 transition-colors duration-300">
                {/* Background Decor - Subtle Light Gradients */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-200/30 dark:bg-orange-900/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-green-200/30 dark:bg-green-900/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 h-full w-full flex flex-col">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
