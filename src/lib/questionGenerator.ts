import { generateQuestions as deepseekGenerate } from './deepseek';
import { checkRateLimit, recordRateLimit } from './session';

export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  userAnswer?: number;
}

interface GenerateOptions {
  topic: string;
  difficulty: string;
  mode: 'test' | 'practice';
  existingQuestions?: Question[];
}

// Question cache with TTL
const questionCache = new Map<string, { questions: Question[], timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Get cache key with normalized input
const getCacheKey = (topic: string, difficulty: string): string => 
  `${topic.toLowerCase().trim()}-${difficulty.toLowerCase().trim()}`;

// Enhanced similarity check using Levenshtein distance
const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[b.length][a.length];
};

// Improved similarity check with caching
const similarityCache = new Map<string, boolean>();
const areSimilarQuestions = (q1: Question, q2: Question): boolean => {
  const cacheKey = `${q1.question}-${q2.question}`;
  if (similarityCache.has(cacheKey)) {
    return similarityCache.get(cacheKey)!;
  }

  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const q1Normalized = normalize(q1.question);
  const q2Normalized = normalize(q2.question);
  
  // Quick length comparison
  if (Math.abs(q1Normalized.length - q2Normalized.length) > 10) {
    similarityCache.set(cacheKey, false);
    return false;
  }

  // Use Levenshtein distance for accurate similarity check
  const distance = levenshteinDistance(q1Normalized, q2Normalized);
  const maxLength = Math.max(q1Normalized.length, q2Normalized.length);
  const similarity = 1 - distance / maxLength;

  const result = similarity > 0.8;
  similarityCache.set(cacheKey, result);

  // Limit cache size
  if (similarityCache.size > 1000) {
    const firstKey = similarityCache.keys().next().value;
    similarityCache.delete(firstKey);
  }

  return result;
};

// Optimized unique questions filter
const filterUniqueQuestions = (
  newQuestions: Question[],
  existingQuestions: Question[] = []
): Question[] => {
  const uniqueQuestions: Question[] = [];
  const seen = new Set<string>();

  // Process questions in chunks for better performance
  const chunkSize = 5;
  for (let i = 0; i < newQuestions.length; i += chunkSize) {
    const chunk = newQuestions.slice(i, i + chunkSize);
    
    for (const newQ of chunk) {
      const normalized = newQ.question.toLowerCase().trim();
      if (seen.has(normalized)) continue;

      const isSimilarToExisting = existingQuestions.some(existingQ => 
        areSimilarQuestions(newQ, existingQ)
      );
      
      if (!isSimilarToExisting && 
          !uniqueQuestions.some(uniqueQ => areSimilarQuestions(newQ, uniqueQ))) {
        uniqueQuestions.push(newQ);
        seen.add(normalized);
      }

      if (uniqueQuestions.length >= 5) {
        return uniqueQuestions;
      }
    }
  }

  return uniqueQuestions;
};

// Enhanced validation with specific checks
const validateQuestion = (question: Question): boolean => {
  try {
    // Basic structure validation
    if (!question?.question?.trim() || 
        !Array.isArray(question.options) || 
        question.options.length !== 4 || 
        !question.explanation?.trim()) {
      return false;
    }

    // Content quality validation
    const minQuestionLength = 10;
    const minOptionLength = 2;
    const minExplanationLength = 20;

    if (question.question.trim().length < minQuestionLength ||
        question.explanation.trim().length < minExplanationLength ||
        question.options.some(opt => opt.trim().length < minOptionLength)) {
      return false;
    }

    // Option uniqueness validation
    const uniqueOptions = new Set(question.options.map(opt => opt.trim().toLowerCase()));
    if (uniqueOptions.size !== 4) {
      return false;
    }

    // Answer validation
    if (question.correctAnswer < 0 || question.correctAnswer > 3) {
      return false;
    }

    // Content quality checks
    const questionText = question.question.toLowerCase();
    const hasCommonQuestionWords = /^(what|how|why|when|where|which|who|explain|describe|compare|analyze|evaluate|discuss)/i.test(questionText);
    if (!hasCommonQuestionWords && !questionText.includes('?')) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Question validation error:', error);
    return false;
  }
};

// Clean cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of questionCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      questionCache.delete(key);
    }
  }
}, CACHE_TTL);

export const generateSingleQuestion = async ({
  topic,
  difficulty,
  mode,
  existingQuestions = []
}: GenerateOptions): Promise<Question> => {
  try {
    const rateLimitError = await checkRateLimit();
    if (rateLimitError) {
      throw new Error(rateLimitError);
    }

    const cacheKey = getCacheKey(topic, difficulty);
    const now = Date.now();
    
    // Try to get questions from cache first
    const cachedData = questionCache.get(cacheKey);
    if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
      const uniqueFromCache = filterUniqueQuestions([...cachedData.questions], existingQuestions);
      if (uniqueFromCache.length > 0) {
        return uniqueFromCache[0];
      }
    }

    // Generate new questions
    const batchSize = Math.min(10, 20 - existingQuestions.length);
    const result = await deepseekGenerate(topic, difficulty, batchSize);
    await recordRateLimit();

    // Process and validate questions
    const validQuestions = result.questions
      .map(q => ({
        ...q,
        question: q.question.trim(),
        options: q.options.map(opt => opt.trim()),
        explanation: q.explanation.trim()
      }))
      .filter(validateQuestion);

    // Update cache with new questions
    questionCache.set(cacheKey, {
      questions: validQuestions,
      timestamp: now
    });

    // Limit cache size
    if (questionCache.size > 50) {
      let oldestKey = null;
      let oldestTime = Infinity;
      
      for (const [key, value] of questionCache.entries()) {
        if (value.timestamp < oldestTime) {
          oldestTime = value.timestamp;
          oldestKey = key;
        }
      }
      
      if (oldestKey) {
        questionCache.delete(oldestKey);
      }
    }

    const uniqueQuestions = filterUniqueQuestions(validQuestions, existingQuestions);

    if (uniqueQuestions.length > 0) {
      return uniqueQuestions[0];
    }

    throw new Error('Could not generate a unique question. Please try again.');
  } catch (error) {
    console.error('Question generation error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate question');
  }
};

export const validateTopic = (topic: string): string | null => {
  try {
    const trimmedTopic = topic.trim();
    
    if (!trimmedTopic) {
      return 'Please enter a topic';
    }
    
    if (trimmedTopic.length < 3) {
      return 'Topic must be at least 3 characters long';
    }
    
    if (trimmedTopic.length > 100) {
      return 'Topic is too long';
    }
    
    if (/^[0-9]+$/.test(trimmedTopic)) {
      return 'Topic cannot be just numbers';
    }
    
    if (/^[^a-zA-Z0-9]+$/.test(trimmedTopic)) {
      return 'Topic must contain some letters or numbers';
    }

    // Check for common programming topics
    const commonTopics = [
      'javascript', 'python', 'java', 'c++', 'react', 'angular', 'vue',
      'node.js', 'express', 'mongodb', 'sql', 'html', 'css', 'typescript'
    ];

    const normalizedTopic = trimmedTopic.toLowerCase();
    const isCommonTopic = commonTopics.some(topic => 
      normalizedTopic.includes(topic) || 
      topic.includes(normalizedTopic)
    );

    if (!isCommonTopic && !/^[a-zA-Z\s]{3,}$/.test(trimmedTopic)) {
      // Additional validation for non-common topics
      if (!/^[\w\s-]{3,}$/.test(trimmedTopic)) {
        return 'Topic contains invalid characters';
      }
    }
    
    return null;
  } catch (error) {
    console.error('Topic validation error:', error);
    return 'Invalid topic format';
  }
};