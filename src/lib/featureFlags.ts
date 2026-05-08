// Feature flags backed by localStorage so users can toggle experimental UX
// at runtime without rebuilds. Subscriptions update consumers via a tiny
// EventTarget-based pub/sub.

const STORAGE_PREFIX = 'feature_flag:';

export const FEATURE_FLAGS = {
  projectsView: 'projects_view',
} as const;

export type FeatureFlagKey = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];

const target = new EventTarget();

function fullKey(key: FeatureFlagKey): string {
  return `${STORAGE_PREFIX}${key}`;
}

export function getFlag(key: FeatureFlagKey): boolean {
  try {
    return localStorage.getItem(fullKey(key)) === '1';
  } catch {
    return false;
  }
}

export function setFlag(key: FeatureFlagKey, value: boolean) {
  try {
    if (value) localStorage.setItem(fullKey(key), '1');
    else localStorage.removeItem(fullKey(key));
  } catch {
    // ignore quota / private mode
  }
  target.dispatchEvent(new CustomEvent('change', { detail: { key, value } }));
}

export function subscribeFlag(key: FeatureFlagKey, handler: (value: boolean) => void): () => void {
  const listener = (e: Event) => {
    const detail = (e as CustomEvent).detail as { key: FeatureFlagKey; value: boolean };
    if (detail.key === key) handler(detail.value);
  };
  target.addEventListener('change', listener);
  return () => target.removeEventListener('change', listener);
}
