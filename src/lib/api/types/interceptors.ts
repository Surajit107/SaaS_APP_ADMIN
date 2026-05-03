import type { InternalAxiosRequestConfig } from 'axios';

/** Queued callers waiting on a refresh round-trip. */
export type RefreshSubscriberCallback = (token: string) => void;

/** Attached to outbound requests retried post-refresh. */
export interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/** Nest HTTP filter error body shape (`HttpExceptionFilter`). */
export interface ErrorResponseData {
  success?: boolean;
  message?: string | string[];
  data?: unknown;
  path?: string;
}
