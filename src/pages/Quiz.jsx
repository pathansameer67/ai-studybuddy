import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, CheckCircle, XCircle, Trophy, BarChart, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHistoryStore } from '../store/useHistoryStore';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { getQuizQuestions } from '../services/ai';

const MOCK_QUESTIONS = {
    'default': [
        { id: 1, text: "Which organelle is known as the powerhouse of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Apparatus"], correct: 1 },
        { id: 2, text: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correct: 2 },
        { id: 3, text: "What is the value of Pi to two decimal places?", options: ["3.12", "3.14", "3.16", "3.00"], correct: 1 },
    ],
    'physics': [
        { id: 1, text: "Which law states that F=ma?", options: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Hooke's Law"], correct: 1 },
        { id: 2, text: "What is the speed of light?", options: ["3x10^8 m/s", "3x10^6 m/s", "3000 m/s", "Infinite"], correct: 0 },
        { id: 3, text: "What particle carries a negative charge?", options: ["Proton", "Neutron", "Electron", "Photon"], correct: 2 },
    ]
};

export default function Quiz() {
    const [gameState, setGameState] = useState('LANDING');
    const [topic, setTopic] = useState('');
    const [questions, setQuestions] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswering, setIsAnswering] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (gameState !== 'PLAYING') return;

        // Reset timer for new question
        setTimeLeft(15);

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleAnswer(-1); // Time out (wrong answer)
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentQ, gameState]);

    const startQuiz = async () => {
        if (!topic) return;
        setIsLoading(true);

        try {
            const aiQuestions = await getQuizQuestions(topic);
            setQuestions(aiQuestions);
            setGameState('PLAYING');
            setCurrentQ(0);
            setScore(0);
        } catch (error) {
            console.error("Quiz Start Error:", error);
            alert(`AI Quiz Error: ${error.message || "Could not generate questions for this topic."}\n\nPlease try a different topic or check your API key.`);
            setGameState('LANDING');
        } finally {
            setIsLoading(false);
        }
    };

    const { logQuiz } = useAnalyticsStore();
    const { addHistoryItem } = useHistoryStore();

    const handleAnswer = (index) => {
        setSelectedOption(index);
        setIsAnswering(true);

        const isCorrect = index === questions[currentQ].correct;
        if (isCorrect) setScore(s => s + 1);

        setTimeout(() => {
            if (currentQ < questions.length - 1) {
                setCurrentQ(c => c + 1);
                setSelectedOption(null);
                setIsAnswering(false);
            } else {
                setGameState('RESULTS');
                // Calculate final score including the current one if correct
                const finalScore = isCorrect ? score + 1 : score;
                logQuiz(finalScore, questions.length);
                addHistoryItem('quiz', `Completed ${topic} Quiz`, {
                    score: `${finalScore}/${questions.length}`,
                    color: 'bg-green-500/10 text-green-400'
                });
                // Also add some study time (mocking 15 mins for a quiz)
                useAnalyticsStore.getState().addStudyTime(0.25);
            }
        }, 1200);
    };

    return (
        <div className="h-full p-6 overflow-y-auto custom-scrollbar flex flex-col">
            <AnimatePresence mode="wait">
                {gameState === 'LANDING' && (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center"
                    >
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20 rotate-12">
                            <BookOpen size={48} className="text-white -rotate-12" />
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Start a Knowledge Check</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg mb-8">Enter a subject, and our AI will instantly generate a challenging quiz.</p>

                        <div className="w-full relative max-w-md group">
                            <input
                                type="text"
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-6 pr-14 text-slate-900 dark:text-white text-lg focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-400 dark:placeholder-slate-600 shadow-xl disabled:opacity-50"
                                placeholder="e.g., Physics, History, Math..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && startQuiz()}
                                disabled={isLoading}
                            />
                            <button
                                onClick={startQuiz}
                                disabled={isLoading}
                                className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center text-white transition-all shadow-lg hover:shadow-blue-500/50 disabled:bg-slate-700"
                            >
                                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={20} fill="currentColor" />}
                            </button>
                        </div>

                        <div className="mt-8 flex gap-3 text-sm text-slate-500 dark:text-slate-400">
                            <span className="bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/5">Try: Quantum Physics</span>
                            <span className="bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/5">Try: European History</span>
                        </div>
                    </motion.div>
                )}

                {gameState === 'PLAYING' && (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="max-w-3xl mx-auto h-full flex flex-col justify-center"
                    >
                        <div className="mb-8 flex justify-between items-end">
                            <div>
                                <span className="text-blue-500 dark:text-blue-400 font-bold tracking-wider text-sm uppercase">Question {currentQ + 1} / {questions.length}</span>
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2 leading-tight">{questions[currentQ].text}</h2>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${timeLeft <= 5 ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border-red-200 dark:border-red-900/30 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                                <Clock size={16} />
                                <span className="font-mono">{`00:${timeLeft.toString().padStart(2, '0')}`}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {questions[currentQ].options.map((option, idx) => {
                                const isSelected = selectedOption === idx;
                                const isCorrect = idx === questions[currentQ].correct;
                                const showResult = isAnswering;

                                let styleClass = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm text-slate-900 dark:text-white";
                                if (showResult) {
                                    if (isCorrect) styleClass = "bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-200";
                                    else if (isSelected) styleClass = "bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-200";
                                    else styleClass = "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 opacity-50 text-slate-500 dark:text-slate-500";
                                } else if (isSelected) {
                                    styleClass = "bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/50 text-blue-700 dark:text-blue-200";
                                }

                                return (
                                    <motion.button
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        whileHover={!isAnswering ? { scale: 1.01, x: 4 } : {}}
                                        onClick={() => !isAnswering && handleAnswer(idx)}
                                        className={`p-6 text-left rounded-2xl border transition-all flex justify-between items-center ${styleClass}`}
                                    >
                                        <span className="font-medium text-lg">{option}</span>
                                        {showResult && isCorrect && <CheckCircle className="text-green-400" />}
                                        {showResult && isSelected && !isCorrect && <XCircle className="text-red-400" />}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {gameState === 'RESULTS' && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md mx-auto h-full flex flex-col justify-center text-center"
                    >
                        <div className="w-40 h-40 bg-gradient-to-tr from-yellow-400/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-8 ring-4 ring-yellow-400/20 shadow-2xl shadow-yellow-500/10">
                            <Trophy size={80} className="text-yellow-400 drop-shadow-lg" />
                        </div>

                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Quiz Completed!</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">You scored {score} out of {questions.length}</p>

                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 mb-8 grid grid-cols-2 gap-4 shadow-sm">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-500 dark:text-blue-400">{Math.round((score / questions.length) * 100)}%</div>
                                <div className="text-xs text-slate-500 dark:text-slate-500 uppercase font-bold tracking-wider mt-1">Accuracy</div>
                            </div>
                            <div className="text-center border-l border-slate-200 dark:border-slate-800">
                                <div className="text-2xl font-bold text-green-500 dark:text-green-400">{score}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-500 uppercase font-bold tracking-wider mt-1">Correct</div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => { setTopic(''); setGameState('LANDING'); }}
                                className="flex-1 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl font-bold transition-colors text-slate-700 dark:text-slate-300"
                            >
                                Try Another
                            </button>
                            <button
                                onClick={() => navigate('/analysis')}
                                className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold transition-colors shadow-lg shadow-blue-600/20 text-white"
                            >
                                View Analytics
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
