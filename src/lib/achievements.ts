import type { AppState, Language } from "./types";
import { lessonsFor } from "../data";
import { levelFromXp } from "./progress";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: "footprints" | "book" | "trophy" | "crown" | "flame" | "zap" | "target" | "star" | "gamepad" | "calendar" | "keyboard" | "languages" | "medal" | "sparkles";
  check: (s: AppState) => boolean;
}

const completedIds = (s: AppState) => Object.keys(s.progress).filter((id) => s.progress[id].completed);
const completedIn = (s: AppState, lang: Language, from: number, to: number) => {
  const done = new Set(completedIds(s));
  return lessonsFor(lang).filter((l) => l.number >= from && l.number <= to).every((l) => done.has(l.id));
};
const threeStars = (s: AppState) => Object.values(s.progress).filter((p) => p.stars >= 3).length;

export const ACHIEVEMENT_XP = 40;

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-steps", title: "First steps", description: "Complete your first lesson.", icon: "footprints", check: (s) => completedIds(s).length >= 1 },
  { id: "ten-lessons", title: "Warming up", description: "Complete 10 lessons.", icon: "book", check: (s) => completedIds(s).length >= 10 },
  { id: "fifty-lessons", title: "Halfway to fluent", description: "Complete 50 lessons.", icon: "trophy", check: (s) => completedIds(s).length >= 50 },
  { id: "hundred-lessons", title: "Century", description: "Complete 100 lessons.", icon: "crown", check: (s) => completedIds(s).length >= 100 },
  { id: "english-basic", title: "English foundations", description: "Finish all English Basic lessons (1–30).", icon: "keyboard", check: (s) => completedIn(s, "en", 1, 30) },
  { id: "khmer-basic", title: "ឫសគល់ខ្មែរ · Khmer foundations", description: "Finish all Khmer Basic lessons (1–30).", icon: "keyboard", check: (s) => completedIn(s, "km", 1, 30) },
  { id: "english-master", title: "English master", description: "Complete all 100 English lessons.", icon: "crown", check: (s) => completedIn(s, "en", 1, 100) },
  { id: "khmer-master", title: "Khmer master", description: "Complete all 100 Khmer lessons.", icon: "crown", check: (s) => completedIn(s, "km", 1, 100) },
  { id: "bilingual", title: "Bilingual typist", description: "Complete a lesson in both English and Khmer.", icon: "languages", check: (s) => completedIds(s).some((i) => i.startsWith("en-")) && completedIds(s).some((i) => i.startsWith("km-")) },
  { id: "perfectionist", title: "Perfectionist", description: "Finish a run with 100% accuracy.", icon: "target", check: (s) => s.totals.perfect >= 1 },
  { id: "flawless-five", title: "Flawless five", description: "Finish 5 runs with 100% accuracy.", icon: "medal", check: (s) => s.totals.perfect >= 5 },
  { id: "three-star-ten", title: "Star collector", description: "Earn 3 stars on 10 lessons.", icon: "star", check: (s) => threeStars(s) >= 10 },
  { id: "streak-3", title: "Getting consistent", description: "Practice 3 days in a row.", icon: "flame", check: (s) => s.streak.best >= 3 },
  { id: "streak-7", title: "Week warrior", description: "Practice 7 days in a row.", icon: "flame", check: (s) => s.streak.best >= 7 },
  { id: "streak-30", title: "Unstoppable", description: "Practice 30 days in a row.", icon: "flame", check: (s) => s.streak.best >= 30 },
  { id: "wpm-40", title: "Quick fingers", description: "Reach 40 WPM in English (85%+ accuracy).", icon: "zap", check: (s) => s.pb.en.wpm >= 40 },
  { id: "wpm-60", title: "Speedster", description: "Reach 60 WPM in English (85%+ accuracy).", icon: "zap", check: (s) => s.pb.en.wpm >= 60 },
  { id: "km-120", title: "ល្បឿនខ្មែរ · Khmer pace", description: "Reach 120 CPM in Khmer (85%+ accuracy).", icon: "zap", check: (s) => s.pb.km.cpm >= 120 },
  { id: "km-200", title: "Khmer sprinter", description: "Reach 200 CPM in Khmer (85%+ accuracy).", icon: "zap", check: (s) => s.pb.km.cpm >= 200 },
  { id: "level-5", title: "Level 5", description: "Reach level 5.", icon: "sparkles", check: (s) => levelFromXp(s.xp) >= 5 },
  { id: "level-10", title: "Level 10", description: "Reach level 10.", icon: "sparkles", check: (s) => levelFromXp(s.xp) >= 10 },
  { id: "game-on", title: "Game on", description: "Finish your first typing game.", icon: "gamepad", check: (s) => s.totals.games >= 1 },
  { id: "game-20", title: "Arcade regular", description: "Finish 20 typing games.", icon: "gamepad", check: (s) => s.totals.games >= 20 },
  { id: "daily-hero", title: "Daily hero", description: "Complete 3 daily challenges.", icon: "calendar", check: (s) => Object.keys(s.dailyChallenges).length >= 3 },
  { id: "marathon", title: "Marathon", description: "Type 10,000 correct characters in total.", icon: "keyboard", check: (s) => s.totals.chars >= 10000 },
];
