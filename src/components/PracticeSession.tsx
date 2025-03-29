import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, XCircle, ArrowLeft, Clock, Target, 
  Plus, RefreshCw, AlertCircle 
} from 'lucide-react';
import { usePracticeStore } from '../store/practiceStore';
import { generateSingleQuestion } from '../lib/questionGenerator';
import CloseButton from './CloseButton';

export default function PracticeSession() {
  const navigate = useNavigate();
  const { 
    questions, currentTopic, difficulty, 
    setUserAnswer, addQuestions, resetPractice 
  } = usePracticeStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  if (!questions.length) {
    navigate('/practice');
    return null;
  }

  const handleAnswer = (answerIndex: number) => {
    if (questions[currentQuestion].userAnswer !== undefined) return;
    setUserAnswer(currentQuestion, answerIndex);
    setShowExplanation(true);
    setFeedback({
      message: answerIndex === questions[currentQuestion].correctAnswer ? 'Correct!' : 'Incorrect',
      type: answerIndex === questions[currentQuestion].correctAnswer ? 'success' : 'error'
    });
  };

  const handleLoadMoreQuestions = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    setError(null);
    setFeedback(null);

    try {
      const newQuestions = [];
      for (let i = 0; i < 5; i++) {
        const question = await generateSingleQuestion({
          topic: currentTopic,
          difficulty,
          mode: 'practice',
          existingQuestions: [...questions, ...newQuestions]
        });
        newQuestions.push(question);
      }
      addQuestions(newQuestions);
      setFeedback({ message: 'New questions added!', type: 'success' });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate more questions');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
      setFeedback(null);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowExplanation(true);
    }
  };

  const handleNewTopic = () => {
    resetPractice();
    navigate('/practice');
  };

  const question = questions[currentQuestion];
  const isCorrect = question.userAnswer === question.correctAnswer;
  const hasAnswered = question.userAnswer !== undefined;
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <div className="max-w-3xl mx-auto">
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`mb-4 p-4 rounded-xl flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p>{feedback.message}</p>
        </motion.div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              {currentTopic}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                {difficulty}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Question {currentQuestion + 1} of {questions.length}
              </div>
            </div>
          </div>
          <CloseButton />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {question.question}
            </h3>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleAnswer(index)}
                  disabled={hasAnswered}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    hasAnswered
                      ? index === question.correctAnswer
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : index === question.userAnswer
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 text-gray-700 dark:text-gray-300'
                  } flex items-center gap-4`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    hasAnswered
                      ? index === question.correctAnswer
                        ? 'border-green-500 bg-green-500'
                        : index === question.userAnswer
                        ? 'border-red-500 bg-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {hasAnswered && index === question.correctAnswer && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                    {hasAnswered && index === question.userAnswer && index !== question.correctAnswer && (
                      <XCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span>{option}</span>
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-4 rounded-xl ${
                    isCorrect
                      ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <p className={`font-medium ${
                      isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                    }`}>
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </p>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {question.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between gap-4">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestion === 0}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 transition-all bg-white dark:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>

        {isLastQuestion ? (
          <div className="flex-1 flex gap-2">
            <button
              onClick={handleNewTopic}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              New Topic
            </button>
            <button
              onClick={handleLoadMoreQuestions}
              disabled={loadingMore}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {loadingMore ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>More Questions</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={handleNextQuestion}
            disabled={!hasAnswered}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            Next Question
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}
    </div>
  );
}