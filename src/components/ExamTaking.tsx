import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, ChevronLeft, ChevronRight, Clock, Flag
} from 'lucide-react';
import { useExamStore } from '../store/examStore';
import CloseButton from './CloseButton';

export default function ExamTaking() {
  const navigate = useNavigate();
  const { questions, currentTopic, setUserAnswer, completeExam } = useExamStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleAnswer = (optionIndex: number) => {
    setUserAnswer(currentQuestion, optionIndex);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmit = () => {
    completeExam();
    navigate('/test');
  };

  if (!questions.length) {
    navigate('/');
    return null;
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredQuestions = questions.filter(q => q.userAnswer !== undefined).length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              {currentTopic}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Question {currentQuestion + 1} of {questions.length}
              </div>
              <div className="flex items-center gap-1">
                <Flag className="w-4 h-4" />
                {answeredQuestions} answered
              </div>
            </div>
          </div>
          <CloseButton />
        </div>
        
        <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-8">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
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
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    question.userAnswer === index
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 text-gray-700 dark:text-gray-300'
                  } flex items-center gap-4`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    question.userAnswer === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {question.userAnswer === index && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span>{option}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between gap-4">
        <button
          onClick={() => setCurrentQuestion(currentQuestion - 1)}
          disabled={currentQuestion === 0}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 transition-all bg-white dark:bg-gray-800"
        >
          <ChevronLeft className="h-5 w-5" />
          Previous
        </button>

        {currentQuestion === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={questions.some(q => q.userAnswer === undefined)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl transition-all font-medium ${
              questions.some(q => q.userAnswer === undefined)
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
            }`}
          >
            Submit Test
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            disabled={currentQuestion === questions.length - 1}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 transition-all bg-white dark:bg-gray-800"
          >
            Next
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}