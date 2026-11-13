export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type Language = 'uz' | 'en' | 'ru';
export type Theme = 'light' | 'dark';
export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: CEFRLevel;
  coins: number;
  completedEssays: number;
  streakDays: number;
  rank: number;
  joinedAt: string;
  role: UserRole;
  isAuthenticated: boolean;
  passwordHash?: string;
  googleId?: string;
}

export interface WritingTopic {
  id: string;
  title: string;
  prompt: string;
  guidingQuestions: string[];
  level: CEFRLevel;
  recommendedWords: {
    min: number;
    max: number;
  };
  timeLimitMinutes: number;
  isCustom?: boolean;
  authorId?: string;
  authorName?: string;
}

export interface FeedbackMessage {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'suggestion' | 'bug' | 'topic_request' | 'general';
  subject: string;
  content: string;
  status: 'new' | 'reviewed' | 'resolved';
  createdAt: string;
}

export interface SecurityStrikeLog {
  id: string;
  userName: string;
  userEmail: string;
  topicTitle: string;
  violation: string;
  strikesCount: number;
  wasAborted: boolean;
  timestamp: string;
}

export interface CriterionFeedback {
  name: 'Task Achievement' | 'Organization' | 'Grammar' | 'Vocabulary' | 'Structure';
  score: number; // 1 to 5
  maxScore: 5;
  icon: string;
  color: string;
  summary: string;
  specificErrors?: string[];
  suggestions: string[];
  examples?: {
    original: string;
    correction: string;
    explanation: string;
  }[];
}

export interface EvaluationResultData {
  id: string;
  topicTitle: string;
  essayText: string;
  wordCount: number;
  targetWordCount: { min: number; max: number };
  timeSpentSeconds: number;
  overallScore: number;
  cefrLevel: CEFRLevel;
  coinsEarned: number;
  criteria: {
    taskAchievement: CriterionFeedback;
    organization: CriterionFeedback;
    grammar: CriterionFeedback;
    vocabulary: CriterionFeedback;
    structure: CriterionFeedback;
  };
  timestamp: string;
}

export interface DiagnosticQuestion {
  id: string;
  level: CEFRLevel;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  level: CEFRLevel;
  coins: number;
  essaysCount: number;
  isCurrentUser?: boolean;
}
