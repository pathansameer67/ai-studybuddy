import React from 'react';
import ChatInterface from '../components/ChatInterface';
import { getChatResponse } from '../services/ai';
import { useChatStore } from '../store/useChatStore';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { Sparkles, Zap, Brain, PenTool } from 'lucide-react';

const SUGGESTIONS = [
    { icon: Brain, text: "Explain Quantum Entanglement like I'm 5" },
    { icon: PenTool, text: "Draft an essay outline on Climate Change" },
    { icon: Zap, text: "Quiz me on US History dates" },
    { icon: Sparkles, text: "Summarize the key themes of 1984" }
];

export default function Home() {
    const { messages, addMessage, isTyping, setTyping } = useChatStore();
    const { logMessage } = useAnalyticsStore();

    const handleSendMessage = async (text, attachments = []) => {
        if (!text.trim() && !attachments.length) return;

        await addMessage('user', text, attachments);
        logMessage(); // Log user message
        setTyping(true);

        try {
            // we pass the current messages for context
            const response = await getChatResponse(messages, text, attachments);
            await addMessage('ai', response);
        } catch (error) {
            console.error("Chat Error:", error);
            await addMessage('ai', "Sorry, I'm having trouble thinking right now. Could you try that again?");
        } finally {
            setTyping(false);
        }
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center py-4 px-6 shrink-0">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    <Sparkles className="text-blue-500" size={20} /> AI Study Assistant
                </h2>
            </div>

            <div className="flex-1 bg-white dark:bg-slate-900 border-t border-x border-slate-200 dark:border-slate-800 rounded-t-2xl overflow-hidden shadow-sm relative flex flex-col mx-6 mb-0 transition-colors duration-300">
                {messages.length === 1 && (
                    <div className="absolute inset-x-0 bottom-24 z-10 p-6">
                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                            {SUGGESTIONS.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSendMessage(s.text)}
                                    className="flex items-center gap-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 min-w-[250px] transition-all text-left group shadow-sm"
                                >
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                                        <s.icon size={18} />
                                    </div>
                                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">{s.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-hidden">
                    <ChatInterface
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isTyping={isTyping}
                        placeholder="Ask anything... (e.g., 'Help me solve this calculus problem')"
                    />
                </div>
            </div>
        </div>
    );
}
