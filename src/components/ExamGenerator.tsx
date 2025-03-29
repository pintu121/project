import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, BookOpen, Target, GraduationCap, AlertCircle, 
  Loader, Sparkles, Zap, CheckCircle, ArrowRight,
  Code, Database, FileCheck
} from 'lucide-react';
import { generateSingleQuestion, validateTopic } from '../lib/questionGenerator';
import { checkDuplicateSession, recordSession } from '../lib/session';
import { useExamStore } from '../store/examStore';
import CloseButton from './CloseButton';

const loadingStages = [
  { 
    id: 'init',
    text: "Initializing test environment...", 
    icon: GraduationCap, 
    color: "from-blue-500 to-indigo-500",
    weight: 0.1
  },
  { 
    id: 'analyze',
    text: "Analyzing topic complexity...", 
    icon: Code, 
    color: "from-purple-500 to-pink-500",
    weight: 0.2
  },
  { 
    id: 'generate',
    text: "Generating questions...", 
    icon: Database, 
    color: "from-green-500 to-emerald-500",
    weight: 0.4
  },
  { 
    id: 'validate',
    text: "Validating content...", 
    icon: FileCheck, 
    color: "from-orange-500 to-red-500",
    weight: 0.2
  },
  { 
    id: 'finalize',
    text: "Finalizing test setup...", 
    icon: Sparkles, 
    color: "from-yellow-500 to-amber-500",
    weight: 0.1
  }
];

export default function ExamGenerator() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const { setQuestions, setCurrentTopic, setDifficulty: setExamDifficulty } = useExamStore();

  const progressTimerRef = useRef<NodeJS.Timeout>();
  const stageTimerRef = useRef<NodeJS.Timeout>();
  const generationStartTimeRef = useRef<number>(0);
  const questionCountRef = useRef<number>(0);

  const cleanup = () => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (stageTimerRef.current) clearInterval(stageTimerRef.current);
    progressTimerRef.current = undefined;
    stageTimerRef.current = undefined;
  };

  const calculateProgress = (stagesCompleted: string[], questionsGenerated: number) => {
    const totalQuestions = 5;
    const stageWeights = loadingStages.reduce((acc, stage) => {
      acc[stage.id] = stage.weight;
      return acc;
    }, {} as Record<string, number>);

    const stageProgress = stagesCompleted.reduce((acc, stageId) => 
      acc + (stageWeights[stageId] || 0), 0);

    const questionWeight = stageWeights.generate || 0.4;
    const questionProgress = (questionsGenerated / totalQuestions) * questionWeight;

    return Math.min(((stageProgress + questionProgress) * 100), 100);
  };

  const updateProgress = (targetProgress: number) => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    
    progressTimerRef.current = setInterval(() => {
      setProgress(current => {
        const next = current + (targetProgress - current) * 0.1;
        const rounded = Math.round(next * 100) / 100;
        
        if (Math.abs(targetProgress - rounded) < 0.1) {
          clearInterval(progressTimerRef.current);
          return targetProgress;
        }
        return rounded;
      });
    }, 50);
  };

  const completeStage = (stageId: string) => {
    setCompletedStages(prev => {
      if (prev.includes(stageId)) return prev;
      const newCompleted = [...prev, stageId];
      const newProgress = calculateProgress(newCompleted, questionCountRef.current);
      updateProgress(newProgress);
      return newCompleted;
    });
  };

  const handleStartTest = async () => {
    const topicError = validateTopic(topic);
    if (topicError) {
      setError(topicError);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setProgress(0);
      setCurrentStage(0);
      setCompletedStages([]);
      questionCountRef.current = 0;
      generationStartTimeRef.current = Date.now();

      completeStage('init');

      const isDuplicate = await checkDuplicateSession(topic, 'test');
      if (isDuplicate) {
        throw new Error('You\'ve already taken this test recently. Please try a different topic.');
      }

      completeStage('analyze');

      const questions = [];
      const totalQuestions = 10;

      for (let i = 0; i < totalQuestions; i++) {
        const question = await generateSingleQuestion({
          topic,
          difficulty,
          mode: 'test',
          existingQuestions: questions
        });
        
        questions.push(question);
        questionCountRef.current = i + 1;
        
        const newProgress = calculateProgress(completedStages, questionCountRef.current);
        updateProgress(newProgress);
      }

      completeStage('generate');
      completeStage('validate');
      
      await recordSession(topic, 'test');
      
      completeStage('finalize');

      const timeElapsed = Date.now() - generationStartTimeRef.current;
      const minLoadTime = 2000;
      
      if (timeElapsed < minLoadTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadTime - timeElapsed));
      }

      setQuestions(questions);
      setCurrentTopic(topic);
      setExamDifficulty(difficulty);
      navigate('/test');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate questions');
    } finally {
      cleanup();
      setLoading(false);
      setProgress(0);
      setCompletedStages([]);
      questionCountRef.current = 0;
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_-30%,rgba(79,70,229,0.1),transparent)] pointer-events-none" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center"
              >
                <GraduationCap className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Start Your Test</h2>
                <p className="text-gray-600 dark:text-gray-300">Customize your learning experience</p>
              </div>
            </div>
            <CloseButton />
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-50 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-blue-500" />
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
                  placeholder="Enter a topic (e.g. 'React Hooks')"
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 border-2 border-gray-100 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all"
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
                  <motion.button
                    key={level}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
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
                        className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{level}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartTest}
              disabled={!topic || loading}
              className={`w-full py-4 px-6 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 transition-all ${
                loading || !topic ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:shadow-blue-500/30'
              }`}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Generating Questions ({Math.round(progress)}%)</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-5 h-5" />
                  <span>Start Test</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6 mt-6"
                >
                  <div className="relative h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                    <motion.div
                      animate={{
                        opacity: [0.2, 0.5, 0.2],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    />
                  </div>

                  <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    {loadingStages.map((stage, index) => {
                      const isComplete = completedStages.includes(stage.id);
                      const isCurrent = !isComplete && index === currentStage;
                      
                      return (
                        <motion.div
                          key={stage.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ 
                            opacity: isComplete || isCurrent ? 1 : 0.5,
                            x: 0,
                            scale: isCurrent ? 1.02 : 1
                          }}
                          className="flex items-center gap-3"
                        >
                          <motion.div 
                            className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${stage.color} ${
                              isComplete || isCurrent ? 'opacity-100' : 'opacity-50'
                            }`}
                            animate={isCurrent ? {
                              scale: [1, 1.1, 1],
                            } : {}}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <stage.icon className="w-5 h-5 text-white" />
                          </motion.div>
                          <span className={`text-sm ${
                            isComplete || isCurrent
                              ? 'text-gray-900 dark:text-white font-medium' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {stage.text}
                            {stage.id === 'generate' && questionCountRef.current > 0 && (
                              <span className="ml-1 text-blue-500">
                                ({questionCountRef.current}/5)
                              </span>
                            )}
                          </span>
                          {isComplete && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto"
                            >
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}