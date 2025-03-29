import { create } from 'zustand';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  userAnswer?: number;
}

interface ExamState {
  questions: Question[];
  currentTopic: string;
  difficulty: string;
  isExamComplete: boolean;
  startTime: number;
  setQuestions: (questions: Question[]) => void;
  setCurrentTopic: (topic: string) => void;
  setDifficulty: (difficulty: string) => void;
  setUserAnswer: (questionIndex: number, answer: number) => void;
  completeExam: () => void;
  resetExam: () => void;
  retakeExam: () => void;
}

export const useExamStore = create<ExamState>((set) => ({
  questions: [],
  currentTopic: '',
  difficulty: 'Basic',
  isExamComplete: false,
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
  completeExam: () => set({ isExamComplete: true }),
  resetExam: () => set({ 
    questions: [], 
    currentTopic: '', 
    difficulty: 'Basic',
    isExamComplete: false, 
    startTime: Date.now() 
  }),
  retakeExam: () => set((state) => ({
    questions: state.questions.map(q => ({ ...q, userAnswer: undefined })),
    isExamComplete: false,
    startTime: Date.now()
  })),
}));