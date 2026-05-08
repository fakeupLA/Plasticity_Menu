import type { PersistedState } from '../types';

export const STORAGE_KEY = 'plasticity-radial:v1';

export function loadPersisted(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !Array.isArray(parsed.menus) ||
      typeof parsed.activeMenuId !== 'string' ||
      typeof parsed.slotCount !== 'number'
    ) {
      return null;
    }
    return parsed as PersistedState;
  } catch {
    return null;
  }
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;
export function schedulePersist(snapshot: PersistedState, delayMs = 250) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // ignore quota / private mode
    }
  }, delayMs);
}
