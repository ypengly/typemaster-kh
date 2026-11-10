import type { AppState, Lesson, LessonProgress, ResultSummary, TypingResult } from "./types";
import { localDay, dayDiff } from "./dates";
import { ACHIEVEMENTS, ACHIEVEMENT_XP } from "./achievements";

/* ---------- levels ---------- */
export const xpForLevel = (level: number) => 120 * (level - 1) ** 2;
export const levelFromXp = (xp: number) => Math.floor(Math.sqrt(Math.max(0, xp) / 120)) + 1;

export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  const base = xpForLevel(level);
  const needed = xpForLevel(level + 1) - base;
  const current = xp - base;
  return { level, current, needed, pct: Math.min(100, Math.round((current / needed) * 100)) };
}

const TITLES = ["Beginner", "Learner", "Typist", "Practiced", "Skilled", "Swift", "Expert", "Master", "Grandmaster", "Legend"];
export const levelTitle = (level: number) => TITLES[Math.min(TITLES.length - 1, Math.floor((level - 1) / 2))];

/* ---------- stars & lesson status ---------- */
export function calcStars(accuracy: number, completion: number, recommended: number): number {
  if (completion < 100) return 0;
  if (accuracy >= Math.min(100, recommended + 5)) return 3;
  if (accuracy >= recommended) return 2;
  if (accuracy >= recommended - 10) return 1;
  return 0;
}

export type LessonStatus = "locked" | "available" | "completed";

export function getLessonStatus(lesson: Lesson, lessons: Lesson[], state: AppState): LessonStatus {
  if (state.progress[lesson.id]?.completed) return "completed";
  if (state.settings.unlockAll || lesson.number === 1) return "available";
  const prev = lessons[lesson.number - 2];
  return prev && state.progress[prev.id]?.completed ? "available" : "locked";
}

export function nextLessonToPractice(lessons: Lesson[], state: AppState): Lesson {
  return lessons.find((l) => !state.progress[l.id]?.completed) ?? lessons[lessons.length - 1];
}

/* ---------- streak (what to display) ---------- */
export function displayStreak(state: AppState): number {
  const { lastDay, current } = state.streak;
  if (!lastDay) return 0;
  return dayDiff(lastDay, localDay()) <= 1 ? current : 0;
}

/* ---------- applying a finished run ---------- */
const emptyProgress = (): LessonProgress => ({ completed: false, stars: 0, bestAccuracy: 0, bestCpm: 0, bestWpm: 0, attempts: 0, lastAt: "" });
const GAME_MODES = new Set(["speed", "word", "sentence", "accuracy", "daily"]);

export function applyResult(
  prev: AppState,
  result: TypingResult,
  ctx: { lesson?: Lesson; dailyKey?: string } = {},
): { state: AppState; summary: ResultSummary } {
  const s: AppState = structuredClone(prev);
  const day = localDay(new Date(result.at));
  const levelBefore = levelFromXp(s.xp);

  s.history = [result, ...s.history].slice(0, 500);

  const d = s.daily[day] ?? { seconds: 0, chars: 0, sessions: 0 };
  d.seconds += Math.round(result.timeSec);
  d.chars += result.correct;
  d.sessions += 1;
  s.daily[day] = d;

  s.totals.chars += result.correct;
  s.totals.seconds += Math.round(result.timeSec);
  s.totals.sessions += 1;
  if (GAME_MODES.has(result.mode)) s.totals.games += 1;

  const active = result.correct >= 5;
  if (active && s.streak.lastDay !== day) {
    const continues = s.streak.lastDay !== null && dayDiff(s.streak.lastDay, day) === 1;
    s.streak.current = continues ? s.streak.current + 1 : 1;
    s.streak.lastDay = day;
    s.streak.best = Math.max(s.streak.best, s.streak.current);
  }

  // personal bests (guarded so tiny or sloppy runs cannot set records)
  let personalBest = false;
  if (result.correct >= 20 && result.accuracy >= 85 && result.mode !== "word") {
    const pb = s.pb[result.language];
    if (result.cpm > pb.cpm) {
      pb.cpm = result.cpm;
      pb.accuracy = result.accuracy;
      personalBest = true;
    }
    if (result.language === "en" && result.wpm > pb.wpm) {
      pb.wpm = result.wpm;
      personalBest = true;
    }
  }

  // lesson progress
  let stars = 0;
  let prevStars = 0;
  let firstCompletion = false;
  if (ctx.lesson && result.mode === "lesson") {
    const L = ctx.lesson;
    const p = s.progress[L.id] ?? emptyProgress();
    prevStars = p.stars;
    stars = calcStars(result.accuracy, result.completion, L.recommendedAccuracy);
    p.attempts += 1;
    p.lastAt = result.at;
    p.bestAccuracy = Math.max(p.bestAccuracy, result.accuracy);
    if (result.completion >= 100) {
      p.bestCpm = Math.max(p.bestCpm, result.cpm);
      p.bestWpm = Math.max(p.bestWpm, result.wpm);
    }
    p.stars = Math.max(p.stars, stars);
    if (stars >= 1 && !p.completed) {
      p.completed = true;
      firstCompletion = true;
    }
    s.progress[L.id] = p;
  }

  // daily challenge
  let dailyBonus = false;
  if (result.mode === "daily" && ctx.dailyKey && !s.dailyChallenges[ctx.dailyKey] && result.completion >= 100 && result.accuracy >= 80) {
    s.dailyChallenges[ctx.dailyKey] = true;
    dailyBonus = true;
  }

  // XP
  const perfect = result.accuracy === 100 && result.completion >= 100 && result.correct >= 20;
  let xp = 0;
  if (result.correct >= 5) {
    xp = Math.round(result.correct * 0.35 * (result.accuracy / 100));
    if (perfect) xp += 25;
    if (personalBest) xp += 15;
    if (stars > prevStars) xp += (stars - prevStars) * 15;
    if (firstCompletion) xp += 20;
    if (dailyBonus) xp += 50;
  }
  if (perfect) s.totals.perfect += 1;
  s.xp += xp;

  // achievements
  const newAchievements: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (!s.achievements[a.id] && a.check(s)) {
      s.achievements[a.id] = result.at;
      newAchievements.push(a.id);
    }
  }
  const achievementXp = newAchievements.length * ACHIEVEMENT_XP;
  s.xp += achievementXp;

  const level = levelFromXp(s.xp);
  return {
    state: s,
    summary: {
      xp: xp + achievementXp,
      stars,
      prevStars,
      firstCompletion,
      perfect,
      personalBest,
      dailyBonus,
      newAchievements,
      leveledUp: level > levelBefore,
      level,
    },
  };
}
