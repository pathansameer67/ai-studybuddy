import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Home, Folder, FileText, HelpCircle, Layers, Calendar,
    Clock, BarChart2, History, Settings, LogOut
} from 'lucide-react';
import { useStore } from '../store/useStore';
import clsx from 'clsx';

const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Projects', path: '/projects', icon: Folder },
    { name: 'Summarizer', path: '/summarizer', icon: FileText },
    { name: 'Quiz', path: '/quiz', icon: HelpCircle },
    { name: 'Flashcards', path: '/flashcards', icon: Layers },
    { name: 'Study Plans', path: '/plans', icon: Calendar },
    { name: 'Focus Mode', path: '/focus', icon: Clock },
    { name: 'Analysis', path: '/analysis', icon: BarChart2 },
    { name: 'History', path: '/history', icon: History },
];

export default function Sidebar() {
    const { user, logout } = useStore();

    return (
        <div className="h-screen w-[250px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 overflow-y-auto z-50 shadow-sm font-sans transition-colors duration-300">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white text-lg">S</span>
                    StudyBuddy
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                                isActive
                                    ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 shadow-sm border border-orange-100 dark:border-orange-900/30"
                                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white hover:shadow-sm"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} className={isActive ? "text-orange-500" : "text-slate-400 dark:text-slate-500"} />
                                <span>{item.name}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-black/20">
                <NavLink
                    to="/settings"
                    className={({ isActive }) => clsx("flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium", isActive ? "bg-white dark:bg-white/10 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white hover:shadow-sm")}
                >
                    <Settings size={20} />
                    <span>Settings</span>
                </NavLink>
            </div>
        </div>
    );
}
