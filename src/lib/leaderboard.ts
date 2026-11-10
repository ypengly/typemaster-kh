import type { AppState, Language, TypingResult } from "./types";

/** A leaderboard row. A remote provider (e.g. Supabase) can store and return these same rows. */
export interface LeaderboardEntry {
  id: string;
  userId: string;
  name: string;
  language: Language;
  mode: TypingResult["mode"];
  score: number;
  cpm: number;
  wpm: number;
  accuracy: number;
  at: string;
}

/** Score rewards speed but punishes sloppiness: net characters per minute, squared accuracy. */
export function scoreOf(r: Pick<TypingResult, "cpm" | "accuracy" | "correct">): number {
  if (r.correct < 20) return 0;
  return Math.round(r.cpm * (r.accuracy / 100) ** 2);
}

export interface LeaderboardProvider {
  top(language: Language, limit: number): Promise<LeaderboardEntry[]>;
  submit(entry: LeaderboardEntry): Promise<void>;
}

export function localEntries(state: AppState): LeaderboardEntry[] {
  return state.history
    .map((r) => ({
      id: r.id,
      userId: state.profile.userId,
      name: state.profile.name,
      language: r.language,
      mode: r.mode,
      score: scoreOf(r),
      cpm: r.cpm,
      wpm: r.wpm,
      accuracy: r.accuracy,
      at: r.at,
    }))
    .filter((e) => e.score > 0);
}
