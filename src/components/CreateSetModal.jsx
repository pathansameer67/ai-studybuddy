import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, BookOpen, Layers } from 'lucide-react';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { useFlashcardStore } from '../store/useFlashcardStore';

export default function CreateSetModal({ isOpen, closeModal, onSave }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [count, setCount] = useState('20');

    const [isGenerating, setIsGenerating] = useState(false);
    const { logFlashcards } = useAnalyticsStore();
    const { addSet } = useFlashcardStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title) return;

        setIsGenerating(true);
        try {
            // Import dynamically or pass as prop if import fails, but since we are in same project structure:
            const { getFlashcards } = await import('../services/ai');
            const cards = await getFlashcards(title, parseInt(count), description);

            await addSet({ title, count: parseInt(count), description, cards });

            // Log analytics
            logFlashcards(parseInt(count));
            useAnalyticsStore.getState().addStudyTime(0.1); // Mock 6 mins for creating set

            useHistoryStore.getState().addHistoryItem('flashcards', `Generated ${title} set`, {
                color: 'bg-purple-500/10 text-purple-400'
            });

            setTitle('');
            setDescription('');
            closeModal();
        } catch (error) {
            console.error("Failed to generate cards", error);
            alert(`AI Flashcard Error: ${error.message || "Failed to generate flashcards."}\n\nPlease try again with a different topic or description.`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeModal}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-900 border border-white/10 p-6 text-left align-middle shadow-2xl transition-all">
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-white flex items-center gap-2">
                                        <Layers className="text-blue-500" />
                                        Generate Flashcard Set
                                    </Dialog.Title>
                                    <button onClick={closeModal} className="text-slate-400 hover:text-white bg-white/5 p-1 rounded-lg">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Topic / Subject</label>
                                        <input
                                            type="text"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50"
                                            placeholder="e.g., Photosynthesis"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            autoFocus
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Description (Optional)</label>
                                        <textarea
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 resize-none h-24"
                                            placeholder="Specific chapters or concepts to focus on..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Card Count</label>
                                        <select
                                            value={count}
                                            onChange={(e) => setCount(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50"
                                        >
                                            <option value="10">10 Cards</option>
                                            <option value="20">20 Cards</option>
                                            <option value="30">30 Cards</option>
                                            <option value="50">50 Cards</option>
                                        </select>
                                    </div>

                                    <div className="mt-8">
                                        <button
                                            type="submit"
                                            className="w-full inline-flex justify-center items-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-bold text-white hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
                                        >
                                            <BookOpen size={18} /> Generate with AI
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
