import type { AppState } from "./types";
import { STORAGE_KEY, migrate } from "./defaults";

/**
 * Storage boundary. Today everything lives in LocalStorage.
 * To add Supabase later, implement this interface (load/save against a table keyed by
 * `state.profile.userId` / the auth user id) and pass it to <StoreProvider adapter={...} />.
 */
export interface StorageAdapter {
  load(): AppState | null;
  save(state: AppState): void;
  clear(): void;
}

export const localStorageAdapter: StorageAdapter = {
  load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? migrate(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  },
  save(state) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked: the app keeps working in memory */
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  },
};
