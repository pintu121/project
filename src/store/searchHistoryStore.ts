import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TopicNote {
  title: string;
  content: string;
  summary: string;
  keywords: string[];
}

export interface SearchHistoryItem {
  id: string;
  topic: string;
  summary: string;
  keywords: string[];
  timestamp: number;
}

interface SearchHistoryState {
  history: SearchHistoryItem[];
  addSearch: (item: Omit<SearchHistoryItem, 'id' | 'timestamp'>) => void;
  removeSearch: (id: string) => void;
  clearHistory: () => void;
}

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      addSearch: (item) => {
        const newItem = {
          ...item,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };

        // Check for duplicates within the last hour
        const recentSearches = get().history.filter(
          (h) => h.topic.toLowerCase() === item.topic.toLowerCase() && 
          Date.now() - h.timestamp < 3600000
        );

        if (recentSearches.length === 0) {
          set((state) => ({
            history: [newItem, ...state.history].slice(0, 50), // Keep last 50 searches
          }));
        }
      },
      removeSearch: (id) =>
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'search-history-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            history: Array.isArray(persistedState.history) ? persistedState.history : []
          };
        }
        return persistedState;
      }
    }
  )
);