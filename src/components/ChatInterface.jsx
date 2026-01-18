import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image as ImageIcon, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';

export default function ChatInterface({ messages, onSendMessage, isTyping, placeholder = "Ask me anything..." }) {
    const [input, setInput] = useState('');
    const [attachments, setAttachments] = useState([]); // { file, type, preview, content }
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleFileSelect = async (e, type) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const newAttachments = await Promise.all(files.map(async (file) => {
            let metadata = { name: file.name, size: file.size, type: file.type };
            let preview = null;
            let content = null;

            if (file.type.startsWith('image/')) {
                const { fileToBase64 } = await import('../services/fileParsing');
                preview = await fileToBase64(file);
                content = preview; // Base64 for vision
            } else if (file.type === 'application/pdf') {
                const { parsePDF } = await import('../services/fileParsing');
                content = await parsePDF(file);
                preview = 'pdf-icon';
            } else if (file.type.startsWith('text/') || file.name.endsWith('.md')) {
                const { parseTextFile } = await import('../services/fileParsing');
                content = await parseTextFile(file);
                preview = 'text-icon';
            }

            return { file, type: file.type, preview, content, ...metadata };
        }));

        setAttachments(prev => [...prev, ...newAttachments]);
        e.target.value = ''; // Reset input
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() && !attachments.length) return;

        onSendMessage(input, attachments);
        setInput('');
        setAttachments([]);
        // Reset textarea height
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleInput = (e) => {
        const target = e.target;
        target.style.height = 'auto'; // Reset height
        target.style.height = `${Math.min(target.scrollHeight, 200)}px`; // Set new height, max 200px
        setInput(target.value);
    };

    return (
        <div className="flex flex-col h-full relative">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={clsx(
                            "flex w-full mb-4",
                            msg.role === 'user' ? "justify-end" : "justify-start"
                        )}
                    >
                        <div className={clsx(
                            "max-w-[80%] rounded-2xl p-4 shadow-sm",
                            msg.role === 'user'
                                ? "bg-orange-500 text-white rounded-tr-sm"
                                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm"
                        )}>
                            {msg.role === 'ai' && (
                                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-blue-500 dark:text-blue-300 uppercase tracking-wider">
                                    <Sparkles size={12} /> AI Buddy
                                </div>
                            )}
                            <div className="prose dark:prose-invert prose-sm max-w-none">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                            {msg.attachments?.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {msg.attachments.map((at, i) => (
                                        at.type.startsWith('image/') ? (
                                            <img key={i} src={at.content} alt="attached" className="h-20 w-20 object-cover rounded-lg border border-white/20" />
                                        ) : (
                                            <div key={i} className="flex items-center gap-2 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded text-[10px] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400">
                                                <Paperclip size={10} /> {at.name}
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}
                            <div className={clsx("text-[10px] mt-2 opacity-50", msg.role === 'user' ? "text-right" : "text-left")}>
                                {(() => {
                                    if (!msg.timestamp) return 'Just now';
                                    const date = msg.timestamp.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp);
                                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                })()}
                            </div>
                        </div>
                    </motion.div>
                ))}

                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start w-full">
                        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl rounded-tl-sm p-4 flex gap-2 items-center">
                            <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                {/* Previews */}
                {attachments.length > 0 && (
                    <div className="max-w-4xl mx-auto mb-3 flex flex-wrap gap-3">
                        {attachments.map((at, i) => (
                            <div key={i} className="relative group">
                                {at.type.startsWith('image/') ? (
                                    <img src={at.preview} className="h-16 w-16 object-cover rounded-xl border-2 border-orange-500/50" alt="preview" />
                                ) : (
                                    <div className="h-16 px-4 flex flex-col justify-center bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-blue-500/30 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 max-w-[120px]">
                                        <div className="truncate mb-1">{at.name}</div>
                                        <div className="text-[10px] opacity-60 uppercase">{at.type.split('/')[1]}</div>
                                    </div>
                                )}
                                <button
                                    onClick={() => removeAttachment(i)}
                                    className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="max-w-4xl mx-auto bg-slate-50 dark:bg-slate-800/50 border focus-within:border-orange-500/50 border-slate-200 dark:border-slate-700 rounded-xl p-2 flex items-end gap-2 shadow-sm transition-all">
                    <div className="flex">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => handleFileSelect(e, 'doc')}
                            accept=".pdf,.txt,.md"
                            className="hidden"
                            multiple
                        />
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="p-2 text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors"
                            title="Attach File"
                        >
                            <Paperclip size={20} />
                        </button>

                        <input
                            type="file"
                            ref={imageInputRef}
                            onChange={(e) => handleFileSelect(e, 'img')}
                            accept="image/*"
                            className="hidden"
                            multiple
                        />
                        <button
                            onClick={() => imageInputRef.current.click()}
                            className="p-2 text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors"
                            title="Upload Image"
                        >
                            <ImageIcon size={20} />
                        </button>
                    </div>

                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none max-h-[200px] py-3 text-sm"
                        rows={1}
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={!input.trim() && !attachments.length}
                        className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/25"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
