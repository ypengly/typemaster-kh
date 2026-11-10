export type Language = "en" | "km";
export type Difficulty = "basic" | "intermediate" | "advanced";
export type LessonKind = "drill" | "words" | "text";
export type ResultMode = "lesson" | "test" | "speed" | "word" | "sentence" | "accuracy" | "daily";

export interface Lesson {
  id: string; // e.g. "en-001", "km-042"
  language: Language;
  number: number; // 1..100 inside its academy
  difficulty: Difficulty;
  category: string;
  kind: LessonKind;
  title: string;
  instructions: string;
  text: string; // target text
  estimatedMinutes: number;
  recommendedAccuracy: number; // percent
  /** Default status in the dataset. Real status comes from saved progress (see getLessonStatus). */
  completed: false;
}

export interface TypingResult {
  id: string;
  at: string; // ISO date
  language: Language;
  mode: ResultMode;
  lessonId?: string;
  cpm: number;
  wpm: number; // 0 for Khmer
  accuracy: number;
  correct: number;
  incorrect: number;
  errors: number;
  completion: number;
  timeSec: number;
  total: number;
}

export interface LessonProgress {
  completed: boolean;
  stars: number; // 0-3
  bestAccuracy: number;
  bestCpm: number;
  bestWpm: number;
  attempts: number;
  lastAt: string;
}

export interface Settings {
  theme: "system" | "light" | "dark";
  dailyGoalMinutes: number;
  defaultDurationSec: number; // 0 = unlimited
  unlockAll: boolean;
  fontScale: "sm" | "md" | "lg";
  showLiveStats: boolean;
}

export interface PersonalBest {
  cpm: number;
  wpm: number;
  accuracy: number;
}

export interface AppState {
  version: 1;
  profile: { userId: string; name: string; createdAt: string };
  settings: Settings;
  progress: Record<string, LessonProgress>;
  xp: number;
  history: TypingResult[];
  achievements: Record<string, string>; // id -> ISO date unlocked
  streak: { current: number; best: number; lastDay: string | null };
  daily: Record<string, { seconds: number; chars: number; sessions: number }>;
  dailyChallenges: Record<string, boolean>; // `${lang}:${YYYY-MM-DD}`
  pb: Record<Language, PersonalBest>;
  totals: { chars: number; seconds: number; sessions: number; perfect: number; games: number };
}

export interface ResultSummary {
  xp: number;
  stars: number;
  prevStars: number;
  firstCompletion: boolean;
  perfect: boolean;
  personalBest: boolean;
  dailyBonus: boolean;
  newAchievements: string[];
  leveledUp: boolean;
  level: number;
}
