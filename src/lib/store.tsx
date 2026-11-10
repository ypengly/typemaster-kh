"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AppState, Lesson, ResultSummary, Settings, TypingResult } from "./types";
import { STORAGE_KEY, defaultState, migrate } from "./defaults";
import { localStorageAdapter, type StorageAdapter } from "./storage";
import { applyResult } from "./progress";

interface StoreValue {
  state: AppState;
  /** false until LocalStorage has been read; pages show a skeleton until then. */
  ready: boolean;
  recordResult: (result: TypingResult, ctx?: { lesson?: Lesson; dailyKey?: string }) => ResultSummary;
  updateSettings: (patch: Partial<Settings>) => void;
  updateProfileName: (name: string) => void;
  resetAll: () => void;
  exportJson: () => string;
  importJson: (json: string) => boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children, adapter = localStorageAdapter }: { children: ReactNode; adapter?: StorageAdapter }) {
  const [state, setState] = useState<AppState>(() => defaultState());
  const [ready, setReady] = useState(false);
  const ref = useRef(state);

  const commit = useCallback(
    (next: AppState) => {
      ref.current = next;
      setState(next);
      adapter.save(next);
    },
    [adapter],
  );

  useEffect(() => {
    const loaded = adapter.load();
    if (loaded) {
      ref.current = loaded;
      setState(loaded);
    } else {
      adapter.save(ref.current);
    }
    setReady(true);
  }, [adapter]);

  // keep several open tabs in sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const loaded = adapter.load();
      if (loaded) {
        ref.current = loaded;
        setState(loaded);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [adapter]);

  // theme + font scale
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = state.settings.theme === "dark" || (state.settings.theme === "system" && mq.matches);
      root.classList.toggle("dark", dark);
    };
    apply();
    root.dataset.scale = state.settings.fontScale;
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [state.settings.theme, state.settings.fontScale]);

  const value = useMemo<StoreValue>(
    () => ({
      state,
      ready,
      recordResult: (result, ctx) => {
        const { state: next, summary } = applyResult(ref.current, result, ctx);
        commit(next);
        return summary;
      },
      updateSettings: (patch) => commit({ ...ref.current, settings: { ...ref.current.settings, ...patch } }),
      updateProfileName: (name) =>
        commit({ ...ref.current, profile: { ...ref.current.profile, name: name.trim().slice(0, 30) || "Learner" } }),
      resetAll: () => {
        adapter.clear();
        commit(defaultState());
      },
      exportJson: () => JSON.stringify(ref.current, null, 2),
      importJson: (json) => {
        try {
          const parsed = JSON.parse(json);
          if (!parsed || typeof parsed !== "object" || typeof parsed.progress !== "object" || parsed.version !== 1) return false;
          commit(migrate(parsed));
          return true;
        } catch {
          return false;
        }
      },
    }),
    [state, ready, commit, adapter],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
