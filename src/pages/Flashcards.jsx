import React, { useState } from 'react';
import { Plus, Play, RotateCw, Check, X, ArrowLeft, MoreVertical, Edit, Trash, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CreateSetModal from '../components/CreateSetModal';
import { useFlashcardStore } from '../store/useFlashcardStore';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { useHistoryStore } from '../store/useHistoryStore';

export default function Flashcards() {
    const { sets, deleteSet, updateMastery } = useFlashcardStore();
    const [activeSet, setActiveSet] = useState(null);
    const [currentCard, setCurrentCard] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [masteredCount, setMasteredCount] = useState(0);

    const handleNext = (mastered = false) => {
        if (mastered) setMasteredCount(prev => prev + 1);

        setIsFlipped(false);
        const currentCards = activeSet?.cards || [];
        setTimeout(() => {
            if (currentCard < currentCards.length - 1) {
                setCurrentCard(c => c + 1);
            } else {
                // Set Completed
                const finalMastered = mastered ? masteredCount + 1 : masteredCount;
                const masteryPercentage = Math.round((finalMastered / currentCards.length) * 100);

                updateMastery(activeSet.id, masteryPercentage);

                useHistoryStore.getState().addHistoryItem('flashcards', `Studied ${activeSet.title}`, {
                    score: `${masteryPercentage}% Mastery`,
                    color: 'bg-orange-500/10 text-orange-400'
                });

                alert(`Set Completed! Mastery: ${masteryPercentage}%`);
                setActiveSet(null);
                setCurrentCard(0);
                setMasteredCount(0);
            }
        }, 300);
    };

    return (
        <div className="h-full p-6 overflow-y-auto custom-scrollbar">
            {!activeSet ? (
                // GRID VIEW
                <>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Flashcards</h1>
                            <p className="text-slate-500 dark:text-slate-400">Master concepts with active recall</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-xl font-medium shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-md transition-all"
                            >
                                <Sparkles size={20} className="text-purple-500" /> Generate with AI
                            </button>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 btn-orange px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-orange-500/25 transition-all"
                            >
                                <Plus size={20} /> New Set
                            </button>
                        </div>
                    </div>

                    {sets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                            <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-6">
                                <Plus size={40} className="text-orange-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No flashcards yet</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm">Create your first set to start studying! You can generate them with AI or make them manually.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {sets.map((set, idx) => (
                                <motion.div
                                    key={set.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white border border-slate-200 rounded-2xl p-0 hover:border-orange-200 transition-all group cursor-pointer relative overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md"
                                    onClick={() => setActiveSet(set)}
                                >
                                    <div className="h-32 bg-orange-50 p-6 relative border-b border-orange-100">
                                        <div className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors" onClick={(e) => { e.stopPropagation(); }}>
                                            <MoreVertical size={16} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight line-clamp-2">{set.title}</h3>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">{set.description || "No description provided."}</p>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${set.mastery}%` }} />
                                                </div>
                                                <span className="text-xs text-orange-500 font-bold">{set.mastery}%</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
                                                <span>{set.count} cards</span>
                                                <span>{set.lastStudied}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                                            <button className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-orange-500 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:text-white font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-orange-500">
                                                <Play size={14} /> Study
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                    <CreateSetModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} />
                </>
            ) : (
                // STUDY MODE
                <div className="h-full flex flex-col max-w-2xl mx-auto">
                    <button
                        onClick={() => { setActiveSet(null); setCurrentCard(0); setIsFlipped(false); }}
                        className="self-start flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} /> Back to Sets
                    </button>

                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{activeSet.title}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Card {currentCard + 1} of {activeSet.cards.length}</p>
                        </div>
                    </div>

                    <div className="flex-1 perspective-1000 relative">
                        <motion.div
                            className="w-full h-full max-h-[500px] relative cursor-pointer preserve-3d"
                            onClick={() => setIsFlipped(!isFlipped)}
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {/* FRONT */}
                            <div className="absolute inset-0 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center p-12 text-center backface-hidden shadow-2xl">
                                <span className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Question</span>
                                <h3 className="text-3xl font-bold text-slate-800 dark:text-white leading-relaxed">{activeSet.cards[currentCard].front}</h3>
                                <p className="absolute bottom-8 text-slate-400 dark:text-slate-500 text-sm flex items-center gap-2 animate-pulse">
                                    <RotateCw size={14} /> Tap to flip
                                </p>
                            </div>

                            {/* BACK */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900 border-2 border-blue-200 dark:border-blue-900/50 rounded-3xl flex flex-col items-center justify-center p-12 text-center backface-hidden shadow-2xl" style={{ transform: 'rotateY(180deg)' }}>
                                <span className="text-xs uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-6 font-bold bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/40">Answer</span>
                                <h3 className="text-2xl font-medium text-slate-800 dark:text-white leading-relaxed">{activeSet.cards[currentCard].back}</h3>
                            </div>
                        </motion.div>
                    </div>

                    {/* CONTROLS */}
                    <div className="mt-8 flex justify-center gap-6">
                        <button onClick={() => handleNext(false)} className="group flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all shadow-lg">
                                <X size={28} />
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium group-hover:text-red-400">Still Learning</span>
                        </button>
                        <button onClick={() => handleNext(true)} className="group flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all shadow-lg">
                                <Check size={28} />
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium group-hover:text-green-400">Mastered</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
