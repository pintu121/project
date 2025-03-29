import { create } from 'zustand';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  userAnswer?: number;
}

interface PracticeState {
  questions: Question[];
  currentTopic: string;
  difficulty: string;
  startTime: number;
  setQuestions: (questions: Question[]) => void;
  setCurrentTopic: (topic: string) => void;
  setDifficulty: (difficulty: string) => void;
  setUserAnswer: (questionIndex: number, answer: number) => void;
  resetPractice: () => void;
  addQuestions: (newQuestions: Question[]) => void;
}

export const usePracticeStore = create<PracticeState>((set) => ({
  questions: [],
  currentTopic: '',
  difficulty: 'Basic',
  startTime: Date.now(),
  setQuestions: (questions) => set({ questions, startTime: Date.now() }),
  setCurrentTopic: (topic) => set({ currentTopic: topic }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setUserAnswer: (questionIndex, answer) =>
    set((state) => ({
      questions: state.questions.map((q, i) =>
        i === questionIndex ? { ...q, userAnswer: answer } : q
      ),
    })),
  resetPractice: () => set({ 
    questions: [], 
    currentTopic: '', 
    difficulty: 'Basic',
    startTime: Date.now() 
  }),
  addQuestions: (newQuestions) => set((state) => ({
    questions: [...state.questions, ...newQuestions]
  })),
}));