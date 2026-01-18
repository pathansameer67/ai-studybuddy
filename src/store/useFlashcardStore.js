import { create } from 'zustand';
import { db, auth } from '../services/firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export const useFlashcardStore = create((set, get) => ({
    sets: [],
    isLoading: false,

    syncSets: () => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(collection(db, "users", user.uid, "flashcards"));
        return onSnapshot(q, (snapshot) => {
            const sets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            set({ sets });
        });
    },

    addSet: async (setData) => {
        const user = auth.currentUser;
        if (!user) return;

        const newSet = {
            ...setData,
            mastery: 0,
            lastStudied: 'Never',
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, "users", user.uid, "flashcards"), newSet);
        return docRef.id;
    },

    deleteSet: async (setId) => {
        const user = auth.currentUser;
        if (!user) return;

        await deleteDoc(doc(db, "users", user.uid, "flashcards", setId));
    },

    updateMastery: async (setId, mastery) => {
        const user = auth.currentUser;
        if (!user) return;

        await updateDoc(doc(db, "users", user.uid, "flashcards", setId), {
            mastery,
            lastStudied: new Date().toLocaleDateString()
        });
    }
}));
