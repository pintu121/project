import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Brain, Sparkles, Trophy, History, ChevronRight, BookOpen, X, 
  Loader, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHistoryStore } from '../store/historyStore';
import { useSearchHistoryStore } from '../store/searchHistoryStore';
import { marked } from 'marked';
import { generateTopicNotes } from '../lib/deepseek';
import SearchHistory from '../components/SearchHistory';

interface TopicNote {
  title: string;
  content: string;
  summary: string;
  keywords: string[];
}

function HomePage() {
  const navigate = useNavigate();
  const { testHistory } = useHistoryStore();
  const { addSearch } = useSearchHistoryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedNote, setSelectedNote] = useState<TopicNote | null>(null);
  const [notes, setNotes] = useState<TopicNote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSearchHistory, setShowSearchHistory] = useState(false);

  const generateNotes = useCallback(async (topic: string) => {
    setIsSearching(true);
    setError(null);
    setShowSearchHistory(false);
    setSelectedNote(null);

    try {
      const newNote = await generateTopicNotes(topic);
      setNotes(prev => [newNote, ...prev]);
      setSelectedNote(newNote);
      
      addSearch({
        topic: newNote.title,
        summary: newNote.summary,
        keywords: newNote.keywords,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate notes');
    } finally {
      setIsSearching(false);
    }
  }, [addSearch]);

  const handleSearchSelect = (topic: string) => {
    setSearchQuery(topic);
    setShowSearchHistory(false);
    generateNotes(topic);
  };

  const handleQuickAction = (path: string, action?: string) => {
    if (action === 'browse') {
      setShowSearchHistory(true);
      setSelectedNote(null);
      setSearchQuery('');
    } else {
      navigate(path);
    }
  };

  const handleRemoveNote = (indexToRemove: number) => {
    setNotes(prev => prev.filter((_, index) => index !== indexToRemove));
    if (indexToRemove === 0 && selectedNote) {
      setSelectedNote(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchHistory(false);
      generateNotes(searchQuery.trim());
    }
  };

  const handleSearchFocus = () => {
    if (!isSearching && !selectedNote) {
      setShowSearchHistory(true);
    }
  };

  const recentTests = testHistory.slice(0, 3);
  const hasRecentActivity = recentTests.length > 0;

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 bg-gradient-to-b from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 pt-8 pb-4 z-10">
        <div className="px-4">
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative mb-4"
              onSubmit={handleSearchSubmit}
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                placeholder="Search topics to generate study notes..."
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-100 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all text-lg"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchHistory(true);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </motion.form>

            {/* Search Results */}
            <AnimatePresence mode="wait">
              {(isSearching || selectedNote || notes.length > 0 || showSearchHistory) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-4"
                >
                  {isSearching ? (
                    <div className="p-8 flex items-center justify-center">
                      <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                        <Loader className="w-6 h-6 animate-spin" />
                        <span>Generating notes...</span>
                      </div>
                    </div>
                  ) : showSearchHistory ? (
                    <SearchHistory 
                      onSelect={handleSearchSelect} 
                      onClose={() => setShowSearchHistory(false)}
                    />
                  ) : selectedNote ? (
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-6 h-6 text-blue-500" />
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {selectedNote.title}
                          </h2>
                        </div>
                        <button
                          onClick={() => setSelectedNote(null)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div 
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: marked(selectedNote.content) }}
                      />
                    </div>
                  ) : notes.length > 0 && (
                    <div className="p-6 space-y-4">
                      {notes.map((note, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group relative"
                        >
                          <button
                            onClick={() => setSelectedNote(note)}
                            className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                          >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {note.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                              {note.summary}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {note.keywords.map((keyword, kidx) => (
                                <span
                                  key={kidx}
                                  className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveNote(index);
                            }}
                            className="absolute top-4 right-4 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="max-w-4xl mx-auto">
          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-4 mb-8"
          >
            {[
              { icon: Brain, label: 'Quick Test', color: 'from-blue-500 to-cyan-500', path: '/test' },
              { icon: Trophy, label: 'View History', color: 'from-purple-500 to-pink-500', path: '/history' },
              { icon: Sparkles, label: 'Practice Mode', color: 'from-orange-500 to-yellow-500', path: '/practice' },
              { icon: Search, label: 'Explore Topics', color: 'from-green-500 to-emerald-500', path: '/test', action: 'browse' }
            ].map((item, index) => (
              <motion.button
                key={item.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction(item.path, item.action)}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-20 blur-xl rounded-xl transition-all duration-300 group-hover:opacity-30 group-hover:blur-2xl"
                  style={{ background: `linear-gradient(to bottom right, var(--tw-gradient-stops))`, '--tw-gradient-from': item.color.split(' ')[0].split('-')[1], '--tw-gradient-to': item.color.split(' ')[2] }} />
                <div className={`relative p-6 rounded-xl bg-gradient-to-br ${item.color} shadow-lg`}>
                  <item.icon className="h-8 w-8 text-white mb-3" />
                  <span className="text-lg font-medium text-white">{item.label}</span>
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Recent Activity */}
          {hasRecentActivity && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                </div>
                <button
                  onClick={() => navigate('/history')}
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {recentTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">{test.topic}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Score: {test.score.toFixed(1)}% • {test.correctAnswers}/{test.questionsCount} correct
                      </p>
                    </div>
                    <div className={`text-2xl font-bold ${
                      test.score >= 80 ? 'text-green-500' : 
                      test.score >= 60 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {test.score.toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;