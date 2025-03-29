import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExamGenerator from '../components/ExamGenerator';
import ExamTaking from '../components/ExamTaking';
import ExamResults from '../components/ExamResults';
import { useExamStore } from '../store/examStore';
import CloseButton from '../components/CloseButton';

export default function TestPage() {
  const { questions, isExamComplete } = useExamStore();

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,rgba(96,165,250,0.1),transparent)]" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          {/* Main Content */}
          <AnimatePresence mode="wait">
            {questions.length === 0 ? (
              <motion.div
                key="generator"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto"
              >
                <ExamGenerator />
              </motion.div>
            ) : isExamComplete ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ExamResults />
              </motion.div>
            ) : (
              <motion.div
                key="taking"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ExamTaking />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}