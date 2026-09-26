import { API_BASE_URL } from '@/lib/api/env';

/**
 * Render free tier spins down after ~15 minutes idle. Re-ping only after this
 * window so cold starts are covered without spamming on every navigation/refresh.
 */
const WAKE_TTL_MS = 12 * 60 * 1000;
const STORAGE_KEY = 'saas:backend-last-wake-at';

/** At most one wake attempt per JS page load (covers React Strict Mode remounts). */
let scheduledForThisLoad = false;

function buildHealthHeaders(baseUrl: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (baseUrl.includes('ngrok')) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  return headers;
}

function shouldWake(now: number): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw == null) {
      return true;
    }
    const last = Number(raw);
    if (!Number.isFinite(last)) {
      return true;
    }
    return now - last >= WAKE_TTL_MS;
  } catch {
    // Private mode / blocked storage — still allow one attempt this load.
    return true;
  }
}

function markWoken(now: number): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(now));
  } catch {
    // Ignore quota / privacy errors; in-memory guard still prevents repeats this load.
  }
}

/**
 * Fire-and-forget GET /health to wake a sleeping free-tier host.
 * Safe to call from the app root; skips when TTL has not elapsed or already ran this load.
 */
export function wakeBackendIfNeeded(): void {
  if (typeof window === 'undefined' || scheduledForThisLoad) {
    return;
  }

  const now = Date.now();
  if (!shouldWake(now)) {
    return;
  }

  scheduledForThisLoad = true;
  markWoken(now);

  const url = `${API_BASE_URL}/health`;

  void fetch(url, {
    method: 'GET',
    headers: buildHealthHeaders(API_BASE_URL),
    credentials: 'omit',
    cache: 'no-store',
  }).catch(() => {
    // Silent: cold starts and network errors must not surface in the UI.
  });
}
