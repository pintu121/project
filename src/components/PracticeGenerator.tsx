import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Target, Sparkles, AlertCircle, Loader, 
  Search, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateSingleQuestion, validateTopic } from '../lib/questionGenerator';
import { usePracticeStore } from '../store/practiceStore';
import CloseButton from './CloseButton';

export default function PracticeGenerator() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const { setQuestions, setCurrentTopic, setDifficulty: setPracticeDifficulty } = usePracticeStore();

  const handleStartPractice = async () => {
    const topicError = validateTopic(topic);
    if (topicError) {
      setError(topicError);
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const questions = [];
      const questionCount = 5;

      for (let i = 0; i < questionCount; i++) {
        const question = await generateSingleQuestion({
          topic,
          difficulty,
          mode: 'practice',
          existingQuestions: questions
        });
        questions.push(question);
        setProgress(((i + 1) / questionCount) * 100);
      }

      setQuestions(questions);
      setCurrentTopic(topic);
      setPracticeDifficulty(difficulty);
      navigate('/practice/session');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate questions');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Practice Mode</h2>
              <p className="text-gray-600 dark:text-gray-300">Learn at your own pace</p>
            </div>
          </div>
          <CloseButton />
        </div>

        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-blue-500" />
              <label className="font-medium text-gray-900 dark:text-white">Topic</label>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setError(null);
                }}
                placeholder="Enter a topic (e.g. 'JavaScript Basics')"
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 border-2 border-gray-100 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-purple-500" />
              <label className="font-medium text-gray-900 dark:text-white">Difficulty Level</label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['Basic', 'Intermediate', 'Advanced'].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`relative overflow-hidden py-3 px-4 rounded-xl transition-all ${
                    difficulty === level
                      ? 'text-white font-medium'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {difficulty === level && (
                    <motion.div
                      layoutId="difficulty-background"
                      className="absolute inset-0 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{level}</span>
                </button>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartPractice}
            disabled={!topic || loading}
            className={`w-full py-4 px-6 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 text-white font-medium shadow-lg shadow-orange-500/20 flex items-center justify-center gap-3 transition-all ${
              loading || !topic ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:shadow-orange-500/30'
            }`}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Generating Questions ({Math.round(progress)}%)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Start Practice</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>

          {loading && progress > 0 && (
            <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-500 to-yellow-500"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}