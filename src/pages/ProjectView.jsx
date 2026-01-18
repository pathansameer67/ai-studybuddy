import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import ChatInterface from '../components/ChatInterface';
import { getChatResponse } from '../services/ai';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { useAnalyticsStore } from '../store/useAnalyticsStore';

export default function ProjectView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { projects } = useStore();
    const project = projects.find(p => p.id === id);

    const { messages, addMessage, isTyping, setTyping, syncMessages } = useChatStore();
    const { logMessage } = useAnalyticsStore();

    useEffect(() => {
        if (!id) return;
        const unsub = syncMessages(id);
        return () => unsub?.();
    }, [id, syncMessages]);

    const handleSendMessage = async (text, attachments = []) => {
        if (!text.trim() && !attachments.length) return;

        await addMessage('user', text, attachments, id);
        logMessage();
        setTyping(true);

        try {
            const projectContext = `You are a Study Buddy helping a student with their project: "${project?.name || 'Untitled'}". 
            Description: ${project?.description || 'No description provided.'}
            Only provide information and help relevant to this project and its topics.`;

            const response = await getChatResponse(messages, text, attachments, projectContext);
            await addMessage('ai', response, [], id);
        } catch (error) {
            console.error("Project Chat Error:", error);
            await addMessage('ai', "I couldn't process that request within this project context.", [], id);
        } finally {
            setTyping(false);
        }
    };

    if (!project) return <div className="p-10 text-center">Project not found</div>;

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col">
            <div className="flex items-center gap-4 mb-4">
                <button onClick={() => navigate('/projects')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-900">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-900">{project.name}</h2>
                    <p className="text-xs text-slate-400">Last active: {project.lastActivity}</p>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900">
                    <SettingsIcon size={20} />
                </button>
            </div>

            <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-300">
                <ChatInterface
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isTyping={isTyping}
                    placeholder={`Ask about ${project.name}...`}
                />
            </div>
        </div>
    );
}
