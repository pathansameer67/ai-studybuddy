import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, MonitorOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FocusMode() {
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
    const [mode, setMode] = useState('FOCUS'); // FOCUS, BREAK

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Play sound or notify
            alert(mode === 'FOCUS' ? "Focus completed! Take a break." : "Break over! Back to work.");
            if (mode === 'FOCUS') {
                setMode('BREAK');
                setTimeLeft(5 * 60);
            } else {
                setMode('FOCUS');
                setTimeLeft(25 * 60);
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'FOCUS' ? 25 * 60 : 5 * 60);
    };

    const progress = ((mode === 'FOCUS' ? 25 * 60 : 5 * 60) - timeLeft) / (mode === 'FOCUS' ? 25 * 60 : 5 * 60) * 100;

    return (
        <div className="h-[calc(100vh-64px)] flex items-center justify-center relative overflow-hidden">
            {/* Ambient Background */}
            <div className={`absolute inset-0 transition-colors duration-1000 ${mode === 'FOCUS' ? 'bg-blue-900/10' : 'bg-green-900/10'}`} />

            <div className="relative z-10 text-center">
                <h2 className="text-4xl font-bold text-white mb-2 tracking-widest uppercase">{mode === 'FOCUS' ? 'Deep Work' : 'Rest Break'}</h2>
                <p className="text-slate-400 mb-10">Stay distracted-free and crush your goals.</p>

                <div className="relative w-80 h-80 mx-auto mb-10 flex items-center justify-center">
                    {/* SVG Ring */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="160" cy="160" r="140" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                        <circle
                            cx="160" cy="160" r="140"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 140}
                            strokeDashoffset={2 * Math.PI * 140 * (1 - progress / 100)}
                            className={`transition-all duration-1000 ${mode === 'FOCUS' ? 'text-blue-500' : 'text-green-500'}`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-6xl font-mono font-bold text-white tracking-widest">{formatTime(timeLeft)}</span>
                    </div>
                </div>

                <div className="flex gap-6 justify-center">
                    <button
                        onClick={toggleTimer}
                        className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-900 hover:scale-105 transition-transform shadow-2xl shadow-white/10"
                    >
                        {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </button>
                    <button
                        onClick={resetTimer}
                        className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                        <RotateCcw size={28} />
                    </button>
                </div>

                <div className="mt-12">
                    <button className="flex items-center gap-2 mx-auto text-slate-500 hover:text-red-400 transition-colors">
                        <MonitorOff size={18} /> Enable Distraction Blocker
                    </button>
                </div>
            </div>
        </div>
    );
}
