import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';

// Placeholder Pages


// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Projects from './pages/Projects';
import ProjectView from './pages/ProjectView';
import Summarizer from './pages/Summarizer';
import Quiz from './pages/Quiz';
import Flashcards from './pages/Flashcards';
import StudyPlans from './pages/StudyPlans';
import FocusMode from './pages/FocusMode';
import Analysis from './pages/Analysis';
import History from './pages/History';
import Settings from './pages/Settings';

import { useThemeStore } from './store/useThemeStore';
import { useStore } from './store/useStore';
import { useEffect } from 'react';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const isLoading = useStore((state) => state.isLoading);

  if (isLoading) return null; // Fallback handled in App
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  const { theme } = useThemeStore();
  const setUser = useStore((state) => state.setUser);
  const isLoading = useStore((state) => state.isLoading);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [setUser]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 animate-pulse">Initializing Study Buddy...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectView />} />
          <Route path="/summarizer" element={<Summarizer />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/flashcards" element={<Flashcards />} />

          <Route path="/plans" element={<StudyPlans />} />
          <Route path="/focus" element={<FocusMode />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
