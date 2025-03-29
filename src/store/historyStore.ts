import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TestQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number;
  explanation: string;
}

export interface TestResult {
  id: string;
  topic: string;
  difficulty: string;
  score: number;
  questionsCount: number;
  correctAnswers: number;
  timestamp: number;
  timeSpent: number;
  questions: TestQuestion[];
}

interface HistoryState {
  testHistory: TestResult[];
  addTestResult: (result: Omit<TestResult, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      testHistory: [],
      addTestResult: (result) => {
        const newResult = {
          ...result,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };

        // Check for duplicate test results within the last minute
        const recentTests = get().testHistory.filter(test => 
          test.topic === result.topic && 
          Date.now() - test.timestamp < 60000 && 
          test.score === result.score &&
          test.correctAnswers === result.correctAnswers
        );

        if (recentTests.length === 0) {
          set((state) => ({
            testHistory: [newResult, ...state.testHistory].slice(0, 50) // Keep last 50 tests
          }));
        }
      },
      clearHistory: () => set({ testHistory: [] }),
    }),
    {
      name: 'test-history-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            testHistory: Array.isArray(persistedState.testHistory) 
              ? persistedState.testHistory.map((test: any) => ({
                  ...test,
                  questions: test.questions || []
                }))
              : []
          };
        }
        return persistedState;
      }
    }
  )
);