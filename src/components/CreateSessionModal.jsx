import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import DatePicker from 'react-datepicker';

export default function CreateSessionModal({ isOpen, closeModal, onSave, initialDate }) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(initialDate || new Date());
    const [duration, setDuration] = useState('60');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title) return;
        onSave({
            title,
            date: date.toISOString(),
            duration: parseInt(duration),
            color: '#3b82f6' // Default blue
        });
        setTitle('');
        closeModal();
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
                                    <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-white">
                                        Schedule Study Session
                                    </Dialog.Title>
                                    <button onClick={closeModal} className="text-slate-400 hover:text-white bg-white/5 p-1 rounded-lg">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Subject / Title</label>
                                        <input
                                            type="text"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50"
                                            placeholder="e.g., Calculus Midterm Review"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            autoFocus
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
                                            <div className="relative">
                                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                                <DatePicker
                                                    selected={date}
                                                    onChange={(d) => setDate(d)}
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50"
                                                    showTimeSelect
                                                    dateFormat="MMMM d, yyyy h:mm aa"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Duration (min)</label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                                <input
                                                    type="number"
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50"
                                                    value={duration}
                                                    onChange={(e) => setDuration(e.target.value)}
                                                    step="15"
                                                    min="15"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <button
                                            type="submit"
                                            className="w-full inline-flex justify-center rounded-xl border border-transparent bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-bold text-white hover:from-blue-500 hover:to-purple-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-lg"
                                        >
                                            Add to Calendar
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
