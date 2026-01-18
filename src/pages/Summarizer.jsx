import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { FileText, Link, Upload, Copy, Download, Share2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import { getSummary } from '../services/ai';
import { useHistoryStore } from '../store/useHistoryStore';
import { useAnalyticsStore } from '../store/useAnalyticsStore';

import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function Summarizer() {
    const [inputText, setInputText] = useState('');
    const [inputUrl, setInputUrl] = useState('');
    const [summary, setSummary] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file.');
            return;
        }

        setIsGenerating(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item) => item.str).join(' ');
                fullText += pageText + ' ';
            }

            setInputText(fullText); // Populate the text area
        } catch (error) {
            console.error('Error parsing PDF:', error);
            alert('Failed to read PDF file.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSummarize = async () => {
        if (!inputText.trim() && !inputUrl.trim()) return;

        setIsGenerating(true);
        setSummary(''); // Clear previous summary
        try {
            // For now we only handle text input properly, but we can pass URL string too
            const textToProcess = inputText || `Please summarize this URL: ${inputUrl}`;
            const result = await getSummary(textToProcess);
            setSummary(result);

            // Log activity
            useHistoryStore.getState().addHistoryItem('summarizer', `Summarized ${textToProcess.slice(0, 30)}...`, {
                color: 'bg-blue-500/10 text-blue-400'
            });
            useAnalyticsStore.getState().addStudyTime(0.1);
        } catch (error) {
            setSummary("## ⚠️ Error\nFailed to generate summary. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="h-[calc(100vh-64px)] p-6 overflow-hidden flex gap-6">
            {/* INPUT PANEL (40%) */}
            <div className="w-[40%] flex flex-col gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Content Input</h2>
                    <p className="text-slate-400 dark:text-slate-500 text-sm">Paste text, upload a PDF, or drop a link.</p>
                </div>

                <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-1 flex flex-col overflow-hidden shadow-sm">
                    <Tab.Group>
                        <Tab.List className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4">
                            {['Text', 'PDF / Doc', 'Link'].map((item) => (
                                <Tab
                                    key={item}
                                    className={({ selected }) =>
                                        clsx(
                                            'w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-all',
                                            'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                            selected
                                                ? 'bg-white shadow text-slate-900 ring-1 ring-black/5'
                                                : 'text-slate-500 hover:bg-white hover:text-slate-900'
                                        )
                                    }
                                >
                                    {item}
                                </Tab>
                            ))}
                        </Tab.List>
                        <Tab.Panels className="flex-1 flex flex-col">
                            <Tab.Panel className="flex-1 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
                                <textarea
                                    className="flex-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-orange-500/20 resize-none shadow-inner"
                                    placeholder="Paste your study material here..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                />
                                <div className="flex justify-between text-xs text-slate-500 px-2">
                                    <span>{inputText.length} characters</span>
                                    <button onClick={() => setInputText('')} className="hover:text-red-500">Clear</button>
                                </div>
                            </Tab.Panel>

                            <Tab.Panel className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer animate-in fade-in slide-in-from-bottom-2 bg-slate-50/50 dark:bg-slate-800/20 relative">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="text-center p-8 pointer-events-none">
                                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500">
                                        <Upload size={32} />
                                    </div>
                                    <h3 className="text-slate-900 dark:text-white font-medium mb-1">Click or Drag PDF Here</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">PDF (Max 50MB)</p>
                                </div>
                            </Tab.Panel>

                            <Tab.Panel className="flex-1 flex flex-col gap-4 pt-10 animate-in fade-in slide-in-from-bottom-2">
                                <label className="text-sm text-slate-700 font-medium">Article URL</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="url"
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 shadow-sm"
                                            placeholder="https://wikipedia.org/wiki/..."
                                            value={inputUrl}
                                            onChange={(e) => setInputUrl(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </div>

                <button
                    onClick={handleSummarize}
                    disabled={isGenerating}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isGenerating ? (
                        <>
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <FileText size={20} /> Summarize Content
                        </>
                    )}
                </button>
            </div>

            {/* OUTPUT PANEL (60%) */}
            <div className="w-[60%] flex flex-col gap-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">AI Summary</h2>
                        <p className="text-slate-400 dark:text-slate-500 text-sm">Exam-ready bullet points & highlights.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={copyToClipboard} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors" title="Copy">
                            {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                        </button>
                        <button className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors" title="Download PDF">
                            <Download size={20} />
                        </button>
                        <button className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors" title="Share">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 overflow-y-auto relative custom-scrollbar shadow-sm">
                    {summary ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-slate max-w-none">
                            <ReactMarkdown>{summary}</ReactMarkdown>
                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                            <FileText size={64} strokeWidth={1} className="mb-4" />
                            <p>Summary will appear here...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
