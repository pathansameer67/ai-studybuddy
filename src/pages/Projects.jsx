import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, MessageSquare, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CreateProjectModal from '../components/CreateProjectModal';

export default function Projects() {
    const { projects } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">My Projects</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage and track your study goals</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                    <Plus size={20} /> Create New Project
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, index) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="group bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 transition-all hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-900/10 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500" />

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">{project.name}</h3>

                        <div className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-3">
                                <Calendar size={16} className="text-blue-400" />
                                <span>Deadline: {new Date(project.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MessageSquare size={16} className="text-purple-400" />
                                <span>{project.chatCount} chats stored</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock size={16} className="text-green-400" />
                                <span>Active {project.lastActivity}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex justify-between items-center">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300">Open Project</span>
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Plus size={16} className="rotate-45 group-hover:rotate-0 transition-transform text-slate-500 dark:text-slate-400 group-hover:text-white" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <CreateProjectModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} />
        </div>
    );
}
