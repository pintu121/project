import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, XCircle, ArrowLeft, Trophy, Brain, Target, 
  Clock, RefreshCw 
} from 'lucide-react';
import { useExamStore } from '../store/examStore';
import { useHistoryStore } from '../store/historyStore';
import CloseButton from './CloseButton';

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export default function ExamResults() {
  const navigate = useNavigate();
  const { questions, currentTopic, difficulty, resetExam, retakeExam, startTime } = useExamStore();
  const { addTestResult } = useHistoryStore();
  const timeSpent = Date.now() - startTime;

  const correctAnswers = questions.filter(
    (q) => q.userAnswer === q.correctAnswer
  ).length;

  const score = (correctAnswers / questions.length) * 100;
  const scoreColor = score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500';

  const saveTestResult = useCallback(() => {
    if (!questions.length) return;
    
    addTestResult({
      topic: currentTopic,
      difficulty,
      score,
      questionsCount: questions.length,
      correctAnswers,
      timeSpent,
      questions: questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: q.userAnswer,
        explanation: q.explanation
      }))
    });
  }, [addTestResult, currentTopic, difficulty, score, questions, correctAnswers, timeSpent]);

  useEffect(() => {
    if (!questions.length) {
      navigate('/test');
      return;
    }
    saveTestResult();
  }, [questions, navigate, saveTestResult]);

  const handleNewTest = () => {
    resetExam();
    navigate('/test');
  };

  const handleRetake = () => {
    retakeExam();
    navigate('/test');
  };

  if (!questions.length) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="text-center flex-1">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 mb-6"
            >
              <Trophy className="h-12 w-12 text-white" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Test Complete!</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">{currentTopic}</p>
              <div className={`text-5xl font-bold ${scoreColor} mb-2`}>
                {score.toFixed(1)}%
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {correctAnswers} of {questions.length} correct
              </p>
            </motion.div>
          </div>
          <CloseButton />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Topic</span>
            </div>
            <p className="text-blue-700 dark:text-blue-300 text-lg">{currentTopic}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-purple-500" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Difficulty</span>
            </div>
            <p className="text-purple-700 dark:text-purple-300 text-lg">{difficulty}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-green-50 dark:bg-green-900/30 p-6 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-green-500" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Time</span>
            </div>
            <p className="text-green-700 dark:text-green-300 text-lg">
              {formatTime(timeSpent)}
            </p>
          </motion.div>
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className={`p-6 rounded-xl ${
                question.userAnswer === question.correctAnswer
                  ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-start gap-4">
                {question.userAnswer === question.correctAnswer ? (
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Question {index + 1}: {question.question}
                  </h3>
                  <div className="space-y-3 mb-4">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`p-4 rounded-lg ${
                          optionIndex === question.correctAnswer
                            ? 'bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800'
                            : optionIndex === question.userAnswer
                            ? 'bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-800'
                            : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="flex justify-center gap-4 mb-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNewTest}
          className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-lg font-medium"
        >
          <ArrowLeft className="h-5 w-5" />
          New Test
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRetake}
          className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all text-lg font-medium"
        >
          <RefreshCw className="h-5 w-5" />
          Retake Test
        </motion.button>
      </div>
    </div>
  );
}