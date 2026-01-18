import React from 'react';
import { Search, Clock } from 'lucide-react';
import { useHistoryStore } from '../store/useHistoryStore';

export default function History() {
    const { historyItems } = useHistoryStore();

    return (
        <div className="p-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Activity History</h1>
                    <p className="text-slate-500 dark:text-slate-400">Review your past learning sessions</p>
                </div>

                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                    <input
                        type="text"
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 placeholder-slate-400 dark:placeholder-slate-500"
                        placeholder="Search history..."
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                {historyItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                        <Clock size={64} strokeWidth={1} className="mb-4" />
                        <p>No activity yet. Start studying to see your history!</p>
                    </div>
                ) : (
                    historyItems.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/10 transition-colors group cursor-pointer shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${item.color || 'bg-slate-500/10 text-slate-400'}`}>
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-white">{item.title}</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500 mt-1">
                                        <span className="capitalize bg-slate-100 dark:bg-black/20 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">{item.type}</span>
                                        <span>• {item.date}</span>
                                    </div>
                                </div>
                            </div>
                            {item.score && (
                                <div className="text-lg font-bold text-slate-900 dark:text-white">{item.score}</div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
