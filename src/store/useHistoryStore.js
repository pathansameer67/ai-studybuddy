import { create } from 'zustand';
import { db, auth } from '../services/firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';

export const useHistoryStore = create(
    (set, get) => ({
        historyItems: [],

        syncHistory: () => {
            const user = auth.currentUser;
            if (!user) return;

            const q = query(
                collection(db, "users", user.uid, "history"),
                orderBy("timestamp", "desc"),
                limit(50)
            );

            return onSnapshot(q, (snapshot) => {
                const items = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().timestamp?.toDate()?.toLocaleString() || 'Just now'
                }));
                set({ historyItems: items });
            });
        },

        addHistoryItem: async (type, title, metadata = {}) => {
            const user = auth.currentUser;
            if (!user) return;

            const newItem = {
                type,
                title,
                timestamp: serverTimestamp(),
                ...metadata
            };

            await addDoc(collection(db, "users", user.uid, "history"), newItem);
        },

        clearHistory: () => set({ historyItems: [] })
    })
);
