import React, { useState } from 'react';
import { User, Bell, Shield, Moon, Sun, Smartphone, Mail, Lock, LogOut, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function Settings() {
    const { user, logout } = useStore();
    const { theme, setTheme } = useThemeStore();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        reminders: false
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSaveProfile = async () => {
        if (!user?.uid) return;
        setIsLoading(true);
        try {
            await updateDoc(doc(db, "users", user.uid), {
                name: profileData.name,
                phone: profileData.phone
            });
            alert("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to update profile.");
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'preferences', label: 'Preferences', icon: Moon },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    return (
        <div className="h-full p-6 flex flex-col md:flex-row gap-8 overflow-hidden">
            {/* Sidebar */}
            <div className="w-full md:w-64 flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Settings</h1>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                            activeTab === tab.id
                                ? "bg-blue-600 shadow-lg shadow-blue-900/20 text-white"
                                : "hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        )}
                    >
                        <tab.icon size={18} />
                        <span className="font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 overflow-y-auto custom-scrollbar">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-2xl"
                >
                    {activeTab === 'profile' && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                                    {user?.avatar || (user?.name ? user.name.charAt(0) : 'S')}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user?.name || 'Student Name'}</h2>
                                    <p className="text-slate-500 dark:text-slate-400">{user?.email || 'student@example.com'}</p>
                                    <button className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium">Change Avatar</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            disabled
                                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-slate-400 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Phone</label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            placeholder="+1 234 567 890"
                                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-medium transition-all disabled:opacity-50"
                                >
                                    <Save size={18} /> {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 font-medium px-4 py-2 hover:bg-red-500/10 rounded-lg transition-colors">
                                    <LogOut size={18} /> Sign Out
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Appearance</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={clsx("p-4 rounded-xl border flex items-center gap-3 transition-all", theme === 'light' ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5")}
                                    >
                                        <Sun size={20} /> Light Mode
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={clsx("p-4 rounded-xl border flex items-center gap-3 transition-all", theme === 'dark' ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5")}
                                    >
                                        <Moon size={20} /> Dark Mode
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Notification Settings</h3>
                            {[
                                { key: 'email', label: 'Email Notifications', desc: 'Receive study summaries and weekly reports.' },
                                { key: 'push', label: 'Push Notifications', desc: 'Get reminded about upcoming study sessions.' },
                                { key: 'reminders', label: 'Study Reminders', desc: 'Nudge me if I haven\'t studied for 2 days.' }
                            ].map((item) => (
                                <div key={item.key} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl">
                                    <div>
                                        <div className="font-medium text-slate-900 dark:text-white">{item.label}</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-500">{item.desc}</div>
                                    </div>
                                    <button
                                        onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                        className={clsx(
                                            "w-12 h-6 rounded-full transition-colors relative",
                                            notifications[item.key] ? "bg-green-500" : "bg-slate-300 dark:bg-slate-700"
                                        )}
                                    >
                                        <div className={clsx("absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform", notifications[item.key] ? "translate-x-6" : "translate-x-0")} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Security</h3>
                            <div className="space-y-4">
                                <button className="w-full flex justify-between items-center p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-left group">
                                    <div className="flex items-center gap-3">
                                        <Lock size={20} className="text-blue-600 dark:text-blue-400" />
                                        <div>
                                            <div className="font-medium text-slate-900 dark:text-white">Change Password</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-500">Last changed 30 days ago</div>
                                        </div>
                                    </div>
                                    <div className="text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Edit</div>
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

