import { create } from 'zustand';
import { db, auth } from '../services/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export const useAnalyticsStore = create(
    (set, get) => ({
        stats: {
            totalHours: 0,
            tasksDone: 0,
            currentStreak: 0,
            sessions: 0,
            quizScore: 0,
            quizCount: 0,
            flashcardsGenerated: 0,
            messagesSent: 0
        },
        activityData: [
            { name: 'Mon', hours: 0 },
            { name: 'Tue', hours: 0 },
            { name: 'Wed', hours: 0 },
            { name: 'Thu', hours: 0 },
            { name: 'Fri', hours: 0 },
            { name: 'Sat', hours: 0 },
            { name: 'Sun', hours: 0 },
        ],
        subjectData: [
            { name: 'Math', value: 0 },
            { name: 'Physics', value: 0 },
            { name: 'History', value: 0 },
            { name: 'Code', value: 0 },
        ],

        syncAnalytics: () => {
            const user = auth.currentUser;
            if (!user) return;

            const docRef = doc(db, "users", user.uid, "analytics", "main");
            return onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    set({ ...docSnap.data() });
                }
            });
        },

        saveAnalytics: async () => {
            const user = auth.currentUser;
            if (!user) return;
            const { stats, activityData, subjectData } = get();
            await setDoc(doc(db, "users", user.uid, "analytics", "main"), {
                stats, activityData, subjectData
            });
        },

        logQuiz: async (score, total) => {
            set((state) => ({
                stats: {
                    ...state.stats,
                    quizScore: state.stats.quizScore + score,
                    quizCount: state.stats.quizCount + 1,
                    tasksDone: state.stats.tasksDone + 1
                }
            }));
            await get().saveAnalytics();
        },

        logFlashcards: async (count) => {
            set((state) => ({
                stats: {
                    ...state.stats,
                    flashcardsGenerated: state.stats.flashcardsGenerated + count,
                    tasksDone: state.stats.tasksDone + 1
                }
            }));
            await get().saveAnalytics();
        },

        logMessage: async () => {
            set((state) => ({
                stats: {
                    ...state.stats,
                    messagesSent: state.stats.messagesSent + 1
                }
            }));
            await get().saveAnalytics();
        },

        addStudyTime: async (hours) => {
            set((state) => {
                const day = new Date().toLocaleDateString('en-US', { weekday: 'short' });
                const newActivity = state.activityData.map(d =>
                    d.name === day ? { ...d, hours: d.hours + hours } : d
                );
                return {
                    activityData: newActivity,
                    stats: { ...state.stats, totalHours: state.stats.totalHours + hours }
                };
            });
            await get().saveAnalytics();
        }
    })
);
