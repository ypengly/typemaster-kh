import type { AppState } from "./types";

export const STORAGE_KEY = "typemaster-kh:v1";

export function defaultState(): AppState {
  return {
    version: 1,
    profile: {
      userId: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `local-${Date.now()}`,
      name: "Learner",
      createdAt: new Date().toISOString(),
    },
    settings: {
      theme: "system",
      dailyGoalMinutes: 10,
      defaultDurationSec: 120,
      unlockAll: false,
      fontScale: "md",
      showLiveStats: true,
    },
    progress: {},
    xp: 0,
    history: [],
    achievements: {},
    streak: { current: 0, best: 0, lastDay: null },
    daily: {},
    dailyChallenges: {},
    pb: { en: { cpm: 0, wpm: 0, accuracy: 0 }, km: { cpm: 0, wpm: 0, accuracy: 0 } },
    totals: { chars: 0, seconds: 0, sessions: 0, perfect: 0, games: 0 },
  };
}

/** Merge a saved (possibly older) state over the defaults so new fields never crash old saves. */
export function migrate(saved: Partial<AppState> | null): AppState {
  const base = defaultState();
  if (!saved || typeof saved !== "object") return base;
  return {
    ...base,
    ...saved,
    version: 1,
    profile: { ...base.profile, ...saved.profile },
    settings: { ...base.settings, ...saved.settings },
    streak: { ...base.streak, ...saved.streak },
    pb: {
      en: { ...base.pb.en, ...saved.pb?.en },
      km: { ...base.pb.km, ...saved.pb?.km },
    },
    totals: { ...base.totals, ...saved.totals },
    progress: saved.progress ?? {},
    history: Array.isArray(saved.history) ? saved.history : [],
    achievements: saved.achievements ?? {},
    daily: saved.daily ?? {},
    dailyChallenges: saved.dailyChallenges ?? {},
  };
}
