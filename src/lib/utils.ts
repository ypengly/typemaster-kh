import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Language, TypingResult } from "./types";
import type { RunStats } from "./engineTypes";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const LANG_LABEL: Record<Language, string> = { en: "English", km: "Khmer" };
export const LANG_NATIVE: Record<Language, string> = { en: "English", km: "ភាសាខ្មែរ" };
export const LANG_SLUG: Record<Language, string> = { en: "english", km: "khmer" };
export const slugToLang = (slug: string | undefined): Language | null => (slug === "english" ? "en" : slug === "khmer" ? "km" : null);

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export function toResult(stats: RunStats, o: { language: Language; mode: TypingResult["mode"]; lessonId?: string }): TypingResult {
  return {
    id: uid(),
    at: new Date().toISOString(),
    language: o.language,
    mode: o.mode,
    lessonId: o.lessonId,
    cpm: stats.cpm,
    wpm: stats.wpm,
    accuracy: stats.accuracy,
    correct: stats.correct,
    incorrect: stats.incorrect,
    errors: stats.errors,
    completion: stats.completion,
    timeSec: stats.timeSec,
    total: stats.total,
  };
}

export const MODE_LABEL: Record<TypingResult["mode"], string> = {
  lesson: "Lesson",
  test: "Speed test",
  speed: "Speed challenge",
  word: "Word challenge",
  sentence: "Sentence challenge",
  accuracy: "Accuracy challenge",
  daily: "Daily challenge",
};

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
