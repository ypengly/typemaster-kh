import type { Language } from "./types";
import { getSentences } from "./pools";

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const dailyKey = (lang: Language, day: string) => `${lang}:${day}`;

/** Same text for everyone on the same date, so daily scores are comparable. */
export function getDailyChallenge(lang: Language, day: string): string {
  const pool = getSentences(lang);
  const seed = hash(`${lang}-${day}`);
  const a = pool[seed % pool.length];
  const b = pool[(Math.floor(seed / 7) + 3) % pool.length];
  return a === b ? a : lang === "km" ? `${a} ${b}` : `${a} ${b}`;
}
