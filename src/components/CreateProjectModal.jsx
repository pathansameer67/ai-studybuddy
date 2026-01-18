import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useStore } from '../store/useStore';
import { X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function CreateProjectModal({ isOpen, closeModal }) {
    const [name, setName] = useState('');
    const [date, setDate] = useState(new Date());
    const addProject = useStore((state) => state.addProject);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name) return;

        addProject({
            id: Date.now().toString(),
            name,
            date: date.toISOString().split('T')[0],
            chatCount: 0,
            lastActivity: 'Just created'
        });

        setName('');
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
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-800 border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-4">
                                    <Dialog.Title as="h3" className="text-xl font-medium leading-6 text-white">
                                        Create New Project
                                    </Dialog.Title>
                                    <button onClick={closeModal} className="text-slate-400 hover:text-white">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., Biology Midterms"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Target Date</label>
                                        <DatePicker
                                            selected={date}
                                            onChange={(date) => setDate(date)}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            type="submit"
                                            className="w-full inline-flex justify-center rounded-xl border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        >
                                            Create Project
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
