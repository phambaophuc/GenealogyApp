import { useSyncExternalStore } from "react";

export type ViewMode = "member" | "admin";

export interface Prefs {
  viewMode: ViewMode;
  simpleUI: boolean;
}

const STORAGE_KEY = "giapha.prefs";
const DEFAULT_PREFS: Prefs = { viewMode: "member", simpleUI: false };

function readStored(): Prefs {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "");
    return {
      viewMode: stored?.viewMode === "admin" ? "admin" : "member",
      simpleUI: Boolean(stored?.simpleUI),
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

let state: Prefs = readStored();
const listeners = new Set<() => void>();

function update(next: Partial<Prefs>) {
  state = { ...state, ...next };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* trình duyệt chặn localStorage thì chỉ giữ trong phiên */
  }
  listeners.forEach((listener) => listener());
}

export function setViewMode(viewMode: ViewMode) {
  update({ viewMode });
}

export function setSimpleUI(simpleUI: boolean) {
  update({ simpleUI });
}

export function toggleSimpleUI() {
  update({ simpleUI: !state.simpleUI });
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => state,
  );
}
