import type { Language } from "./types";

export interface StatsInput {
  lang: Language;
  correct: number; // correct clusters currently on screen
  incorrect: number; // incorrect clusters currently on screen
  judged: number; // clusters judged at first attempt
  errors: number; // first-attempt mistakes (cumulative)
  committed: number; // clusters typed (not counting a pending Khmer cluster)
  totalClusters: number;
  elapsedMs: number;
}

export interface Stats {
  cpm: number;
  wpm: number;
  accuracy: number;
  correct: number;
  incorrect: number;
  errors: number;
  completion: number;
  timeSec: number;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export function computeStats(i: StatsInput): Stats {
  const minutes = Math.max(i.elapsedMs, 1000) / 60000;
  const cpm = i.correct / minutes;
  // Standard definition: one "word" = 5 characters. Not meaningful for Khmer, so it is 0 there.
  const wpm = i.lang === "en" ? i.correct / 5 / minutes : 0;
  const accuracy = i.judged > 0 ? ((i.judged - i.errors) / i.judged) * 100 : 100;
  const completion = i.totalClusters > 0 ? Math.min(100, (i.committed / i.totalClusters) * 100) : 0;
  return {
    cpm: r1(cpm),
    wpm: r1(wpm),
    accuracy: r1(Math.max(0, accuracy)),
    correct: i.correct,
    incorrect: i.incorrect,
    errors: i.errors,
    completion: r1(completion),
    timeSec: Math.round(i.elapsedMs / 100) / 10,
  };
}

export function formatTime(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}
