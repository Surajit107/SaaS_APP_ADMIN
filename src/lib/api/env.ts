/**
 * Resolved from `.env` / `.env.local` → `VITE_API_BASE_URL` (must include the Nest `/api` prefix).
 */
function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.trim().replace(/\/$/, '');
  }
  return 'http://127.0.0.1:3000/api';
}

export const API_BASE_URL = resolveApiBaseUrl();
