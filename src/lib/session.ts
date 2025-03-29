// Session management with improved error handling and validation
const SESSION_TIMEOUT = 3600000; // 1 hour in milliseconds
const MAX_SESSIONS = 50; // Maximum number of stored sessions

interface SessionData {
  topic: string;
  mode: 'test' | 'practice';
  timestamp: number;
}

const getStoredSessions = (): SessionData[] => {
  try {
    const stored = localStorage.getItem('witsiq-sessions');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading sessions:', error);
    return [];
  }
};

const setStoredSessions = (sessions: SessionData[]): void => {
  try {
    localStorage.setItem('witsiq-sessions', JSON.stringify(sessions));
  } catch (error) {
    console.error('Error storing sessions:', error);
  }
};

export const checkDuplicateSession = async (
  topic: string,
  mode: 'test' | 'practice'
): Promise<boolean> => {
  try {
    if (!topic || !mode) {
      throw new Error('Invalid session parameters');
    }

    const sessions = getStoredSessions();
    const now = Date.now();
    
    // Clean up old sessions
    const validSessions = sessions
      .filter(session => now - session.timestamp < SESSION_TIMEOUT)
      .slice(-MAX_SESSIONS); // Keep only the most recent sessions
    
    // Check for recent duplicate session
    const isDuplicate = validSessions.some(
      session => 
        session.topic.toLowerCase() === topic.toLowerCase() && 
        session.mode === mode &&
        now - session.timestamp < SESSION_TIMEOUT
    );

    // Update storage with cleaned sessions
    setStoredSessions(validSessions);
    
    return isDuplicate;
  } catch (error) {
    console.error('Session check error:', error);
    return false; // Fail safe - allow session if check fails
  }
};

// Removed rate limiting functions as they're not needed
export const checkRateLimit = async (): Promise<string | null> => {
  return null;
};

export const recordRateLimit = async (): Promise<void> => {
  // No-op since rate limiting is removed
};

export const recordSession = async (
  topic: string,
  mode: 'test' | 'practice'
): Promise<void> => {
  try {
    if (!topic || !mode) {
      throw new Error('Invalid session parameters');
    }

    const sessions = getStoredSessions();
    const newSession = {
      topic,
      mode,
      timestamp: Date.now()
    };

    // Add new session and limit total stored sessions
    const updatedSessions = [...sessions, newSession].slice(-MAX_SESSIONS);
    setStoredSessions(updatedSessions);
  } catch (error) {
    console.error('Session recording error:', error);
  }
};