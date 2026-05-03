import axios from 'axios';

import { API_BASE_URL } from '@/lib/api/env';

/**
 * ngrok serves an HTML browser-warning interstitial for requests that don't
 * carry this header. Without it, the browser receives text/html instead of
 * application/json, which manifests as a parse/CORS error in DevTools.
 */
function buildBaseHeaders(baseUrl: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (baseUrl.includes('ngrok')) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  return headers;
}

/**
 * Singleton Axios instance. Interceptors are registered from `setupInterceptors` in Api.ts entry.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: buildBaseHeaders(API_BASE_URL),
});
