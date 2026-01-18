import { create } from 'zustand';
import { db, auth } from '../services/firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, deleteDoc, getDocs } from 'firebase/firestore';

export const useChatStore = create((set, get) => ({
    messages: [],
    isTyping: false,

    syncMessages: (projectId = 'global') => {
        // Clear existing messages to avoid flicker/leakage from previous view
        set({ messages: [] });

        if (projectId === 'global') {
            // Global chat is SESSION-ONLY (reverts to welcome on reload)
            set({
                messages: [{
                    id: 'welcome',
                    role: 'ai',
                    content: "Hi! I'm your AI Study Buddy 📚 How can I help you today?",
                    timestamp: Date.now()
                }]
            });
            return () => { }; // No-op unsubscribe
        }

        const user = auth.currentUser;
        if (!user) return;

        const q = query(
            collection(db, "users", user.uid, "chats", projectId, "messages"),
            orderBy("timestamp", "asc")
        );

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            set({ messages });
        });
    },

    addMessage: async (role, content, attachments = [], projectId = 'global') => {
        const user = auth.currentUser;

        const newMessage = {
            id: Date.now().toString(),
            role,
            content,
            attachments,
            timestamp: role === 'ai' ? new Date() : Date.now() // Local timestamp for immediate feedback
        };

        if (projectId === 'global') {
            // Only update local state for global chat
            set(state => ({ messages: [...state.messages, newMessage] }));
            return;
        }

        if (!user) return;

        // Final Firestore doc (with server timestamp)
        const dbMessage = { ...newMessage, timestamp: serverTimestamp() };
        delete dbMessage.id;

        await addDoc(collection(db, "users", user.uid, "chats", projectId, "messages"), dbMessage);
    },

    setTyping: (status) => set({ isTyping: status }),

    clearHistory: async (projectId = 'global') => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(collection(db, "users", user.uid, "chats", projectId, "messages"));
        const snapshot = await getDocs(q);

        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        if (projectId === 'global') {
            set({
                messages: [{
                    id: 'welcome',
                    role: 'ai',
                    content: "Hi! I'm your AI Study Buddy 📚 How can I help you today?",
                    timestamp: Date.now()
                }]
            });
        } else {
            set({ messages: [] });
        }
    },
}));
