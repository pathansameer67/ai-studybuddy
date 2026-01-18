import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, CheckCircle, Flame, Calendar } from 'lucide-react';
import { useAnalyticsStore } from '../store/useAnalyticsStore';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];

export default function Analysis() {
    const { stats, activityData, subjectData } = useAnalyticsStore();

    // Determine derived data or fallback if empty
    const hasActivity = stats.quizCount > 0 || stats.flashcardsGenerated > 0 || stats.messagesSent > 0;

    // Use stored data or show zeros
    const displayActivity = activityData;

    // Dynamic Subject Data based on actions (Mock logic for specific subjects, but real counts)
    const displaySubjects = [
        { name: 'Quizzes', value: stats.quizCount },
        { name: 'Flashcards', value: stats.flashcardsGenerated },
        { name: 'Chat', value: stats.messagesSent },
    ].filter(d => d.value > 0);

    const safeSubjectData = displaySubjects.length > 0 ? displaySubjects : [{ name: 'No Activity', value: 1 }];

    return (
        <div className="p-6 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Performance Analytics</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Track your study habits and progress.</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { icon: Clock, label: 'Approx Hours', value: `${stats.totalHours.toFixed(1)}h`, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
                    { icon: CheckCircle, label: 'Tasks Done', value: stats.tasksDone.toString(), color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10' },
                    { icon: Flame, label: 'Quizzes Taken', value: stats.quizCount.toString(), color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10' },
                    { icon: Calendar, label: 'Flashcards', value: stats.flashcardsGenerated.toString(), color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-xl">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Weekly Activity</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={displayActivity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-xl">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Activity Distribution</h3>
                    <div className="h-[300px] w-full flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={safeSubjectData}
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {safeSubjectData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {!hasActivity && <p className="text-center text-slate-500 text-sm mt-[-150px]">No activity yet</p>}
                </div>
            </div>
        </div>
    );
}
