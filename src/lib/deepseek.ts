import { marked } from 'marked';

const DEEPSEEK_API_KEY = 'sk-94af60a8ff9b42c58e21f2d3ec9c9598';

interface TopicNote {
  title: string;
  content: string;
  summary: string;
  keywords: string[];
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// Cache for storing generated notes with TTL
const notesCache = new Map<string, { note: TopicNote, timestamp: number }>();
const NOTES_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

// Clean notes cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of notesCache.entries()) {
    if (now - value.timestamp > NOTES_CACHE_TTL) {
      notesCache.delete(key);
    }
  }
}, NOTES_CACHE_TTL);

export async function generateTopicNotes(topic: string): Promise<TopicNote> {
  try {
    const cacheKey = topic.toLowerCase().trim();
    const now = Date.now();

    // Check cache
    const cachedData = notesCache.get(cacheKey);
    if (cachedData && now - cachedData.timestamp < NOTES_CACHE_TTL) {
      return cachedData.note;
    }

    const prompt = `Create a concise guide about "${topic}". Format in Markdown:

# ${topic}

## Key Points
[3-4 main concepts]

## Quick Examples
[1-2 practical examples]

## Remember
[2-3 important tips]

Keep it brief and focused. Return as JSON:
{
  "content": "markdown content",
  "summary": "one-line summary",
  "keywords": ["3 key terms"]
}`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error(response.status === 429 ? "Please try again in a moment." : "Couldn't generate notes.");
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    const note = {
      title: topic,
      content: content.content.replace(/\\n/g, '\n').replace(/\\/g, '').trim(),
      summary: content.summary.trim(),
      keywords: content.keywords.map(k => k.trim())
    };

    // Update cache
    notesCache.set(cacheKey, { note, timestamp: now });
    
    // Limit cache size
    if (notesCache.size > 100) {
      let oldestKey = null;
      let oldestTime = Infinity;
      
      for (const [key, value] of notesCache.entries()) {
        if (value.timestamp < oldestTime) {
          oldestTime = value.timestamp;
          oldestKey = key;
        }
      }
      
      if (oldestKey) {
        notesCache.delete(oldestKey);
      }
    }

    return note;
  } catch (error) {
    console.error('Notes generation error:', error);
    throw new Error(error instanceof Error ? error.message : "Something went wrong.");
  }
}

export async function generateQuestions(topic: string, difficulty: string, count: number): Promise<{ questions: Question[] }> {
  try {
    const prompt = `Create ${count} multiple-choice questions about "${topic}" (${difficulty} level).
Each question should:
- Be clear and focused
- Have 4 distinct options
- Include a detailed explanation
- Match the ${difficulty} difficulty level
- Cover different aspects of the topic
- Follow proper question format (start with question words or end with ?)
- Have meaningful distractors that are plausible but clearly incorrect
- Provide comprehensive explanations that explain why the correct answer is right and why others are wrong
- CRITICAL: The first option (index 0) MUST ALWAYS be the CORRECT answer

Return only JSON:
{
  "questions": [
    {
      "question": "clear, focused question",
      "options": ["correct answer", "wrong option 1", "wrong option 2", "wrong option 3"],
      "correctAnswer": 0,
      "explanation": "detailed explanation why this answer is correct and others are incorrect"
    }
  ]
}`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error(response.status === 429 ? "Please try again in a moment." : "Couldn't generate questions.");
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    // Process questions and randomize options while preserving correct answer
    const processedQuestions = content.questions.map((q: Question) => {
      // Get the correct answer (first option)
      const correctOption = q.options[0];
      
      // Shuffle the wrong options only
      const wrongOptions = q.options.slice(1);
      for (let i = wrongOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wrongOptions[i], wrongOptions[j]] = [wrongOptions[j], wrongOptions[i]];
      }
      
      // Randomly insert the correct answer into a position
      const position = Math.floor(Math.random() * 4);
      const finalOptions = [...wrongOptions];
      finalOptions.splice(position, 0, correctOption);
      
      return {
        question: q.question.trim(),
        options: finalOptions.map(opt => opt.trim()),
        correctAnswer: position,
        explanation: q.explanation.trim()
      };
    });

    return { questions: processedQuestions };
  } catch (error) {
    console.error('Question generation error:', error);
    throw new Error(error instanceof Error ? error.message : "Something went wrong.");
  }
}