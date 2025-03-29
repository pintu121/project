import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, ChevronRight, Tag, ArrowLeft } from 'lucide-react';
import { useSearchHistoryStore, SearchHistoryItem } from '../store/searchHistoryStore';

interface SearchHistoryProps {
  onSelect: (topic: string) => void;
  onClose?: () => void;
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function SearchHistory({ onSelect, onClose }: SearchHistoryProps) {
  const { history, removeSearch } = useSearchHistoryStore();

  if (history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 text-center"
      >
        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">No search history yet</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8"
    >
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
          <Clock className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Searches</h2>
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {history.map((item: SearchHistoryItem) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="group flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => onSelect(item.topic)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{item.topic}</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTimestamp(item.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{item.summary}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs"
                    >
                      <Tag className="w-3 h-3" />
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSearch(item.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}