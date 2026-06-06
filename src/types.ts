/**
 * Types and interfaces for MindMate Student Wellness App
 */

export interface DailyCheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  mood: string; // Emoji + Text prefix
  stressLevel: number; // 1-10 Range
  energyLevel: number; // 1-10 Range
  sleepQuality: 'poor' | 'average' | 'good';
  studyHours: number;
  stressTrigger: string;
  notes?: string;
  aiWellnessSummary?: string; // Cache small AI reflection per daily check-in if users want
}

export interface JournalEntry {
  id: string;
  date: string;
  timestamp: number;
  title: string;
  content: string;
  aiReflection?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  examType: string; // "NEET" | "JEE" | "UPSC" | "GATE" | "CAT" | "CUET" | "Board Exams" | "Other"
  targetYear: string;
  dailyStudyGoal: number; // in hours
}

export interface WellnessQuote {
  text: string;
  author: string;
}
