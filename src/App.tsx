import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Home, History, GraduationCap, Brain, Moon, Sun, Sparkles } from 'lucide-react';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import TestPage from './pages/TestPage';
import HistoryPage from './pages/HistoryPage';
import PracticePage from './pages/PracticePage';
import { useThemeStore } from './store/themeStore';
import { AdProvider } from './components/AdProvider';

function AppContent() {
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header with Theme Toggle */}
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Brain className="w-5 h-5 text-white relative z-10" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2),transparent)] z-0" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">WitsIQ</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">•</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Intelligence Quotient</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Elevate Your Knowledge</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-0 min-h-screen pb-24">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/test/*" element={<TestPage />} />
            <Route path="/practice/*" element={<PracticePage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <Navigation items={[
        { icon: Home, label: 'Home', path: '/' },
        { icon: GraduationCap, label: 'Test', path: '/test' },
        { icon: Sparkles, label: 'Practice', path: '/practice' },
        { icon: History, label: 'History', path: '/history' }
      ]} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AdProvider>
        <AppContent />
      </AdProvider>
    </BrowserRouter>
  );
}

export default App;