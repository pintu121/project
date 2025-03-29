import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Trophy, Brain, Target, 
  Trash2, Calendar, X, ChevronRight, CheckCircle, XCircle 
} from 'lucide-react';
import { useHistoryStore, TestResult } from '../store/historyStore';

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp));
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export default function HistoryPage() {
  const { testHistory, clearHistory } = useHistoryStore();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);

  const averageScore = testHistory.length
    ? testHistory.reduce((acc, test) => acc + test.score, 0) / testHistory.length
    : 0;

  const totalTime = testHistory.reduce((acc, test) => acc + test.timeSpent, 0);

  const handleClearHistory = () => {
    clearHistory();
    setShowConfirmDialog(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen pb-20 px-4 pt-8"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Journey</h1>
          {testHistory.length > 0 && (
            <button
              onClick={() => setShowConfirmDialog(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </button>
          )}
        </div>
        
        {testHistory.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-medium text-gray-900 dark:text-white">Average Score</h3>
                </div>
                <p className="text-3xl font-bold text-yellow-500">{averageScore.toFixed(1)}%</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Brain className="w-5 h-5 text-blue-500" />
                  <h3 className="font-medium text-gray-900 dark:text-white">Tests Taken</h3>
                </div>
                <p className="text-3xl font-bold text-blue-500">{testHistory.length}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-green-500" />
                  <h3 className="font-medium text-gray-900 dark:text-white">Total Time</h3>
                </div>
                <p className="text-3xl font-bold text-green-500">{formatDuration(totalTime)}</p>
              </div>
            </div>

            <div className="space-y-4">
              {testHistory.map((test: TestResult) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedTest(test)}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">{test.topic}</h3>
                        <span className="px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs">
                          {test.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(test.timestamp)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(test.timeSpent)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
                        <p className={`text-xl font-bold ${
                          test.score >= 80 ? 'text-green-500' : 
                          test.score >= 60 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {test.score.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Correct</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {test.correctAnswers}/{test.questionsCount}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No Test History Yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Take your first test to start tracking your progress!
            </p>
          </div>
        )}

        <AnimatePresence>
          {showConfirmDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Clear History
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Are you sure you want to clear your test history? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearHistory}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    Clear History
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {selectedTest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      {selectedTest.topic}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {formatDate(selectedTest.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedTest(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
                    <p className={`text-xl font-bold ${
                      selectedTest.score >= 80 ? 'text-green-500' : 
                      selectedTest.score >= 60 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {selectedTest.score.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Correct Answers</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedTest.correctAnswers}/{selectedTest.questionsCount}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Time Spent</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatDuration(selectedTest.timeSpent)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Difficulty</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedTest.difficulty}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {selectedTest.questions?.map((question, index) => (
                    <div
                      key={index}
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
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}