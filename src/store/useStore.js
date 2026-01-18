import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, auth } from '../services/firebase';
import { doc, getDoc, setDoc, collection, query, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useHistoryStore } from './useHistoryStore';
import { useAnalyticsStore } from './useAnalyticsStore';
import { useChatStore } from './useChatStore';
import { useFlashcardStore } from './useFlashcardStore';

export const useStore = create(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true, // Initial loading state for auth check
            unsubscribes: [],

            setUser: async (firebaseUser) => {
                if (firebaseUser) {
                    // Fetch extra data from Firestore
                    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                    const userData = userDoc.exists() ? userDoc.data() : {};

                    set({
                        user: {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            name: firebaseUser.displayName || userData.name || 'Student',
                            phone: userData.phone || '',
                            avatar: (firebaseUser.displayName || userData.name || 'S').charAt(0).toUpperCase()
                        },
                        isAuthenticated: true,
                        isLoading: false
                    });

                    // Cleanup old unsubscribes
                    get().unsubscribes.forEach(unsub => unsub?.());

                    // Start syncing all stores
                    const unsubProjects = get().syncProjects();
                    const unsubHistory = useHistoryStore.getState().syncHistory();
                    const unsubAnalytics = useAnalyticsStore.getState().syncAnalytics();
                    const unsubChat = useChatStore.getState().syncMessages('global');
                    const unsubFlashcards = useFlashcardStore.getState().syncSets();

                    set({ unsubscribes: [unsubProjects, unsubHistory, unsubAnalytics, unsubChat, unsubFlashcards] });
                } else {
                    get().unsubscribes.forEach(unsub => unsub?.());
                    set({ user: null, isAuthenticated: false, isLoading: false, projects: [], unsubscribes: [] });
                }
            },

            logout: async () => {
                get().unsubscribes.forEach(unsub => unsub?.());
                await signOut(auth);
                set({ user: null, isAuthenticated: false, projects: [], unsubscribes: [] });
            },

            // Projects State
            projects: [],

            syncProjects: () => {
                const { user } = get();
                if (!user) return;

                const q = query(collection(db, "users", user.uid, "projects"));
                return onSnapshot(q, (snapshot) => {
                    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    set({ projects });
                });
            },

            addProject: async (project) => {
                const { user } = get();
                if (!user) return;

                const projectData = {
                    ...project,
                    createdAt: new Date().toISOString()
                };

                // If the project doesn't have an ID, Firestore will generate one
                const projectRef = doc(collection(db, "users", user.uid, "projects"));
                await setDoc(projectRef, { ...projectData, id: projectRef.id });
            },

            sidebarOpen: true,
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        }),
        {
            name: 'study-buddy-storage', // name of the item in storage (must be unique)
        }
    )
);
