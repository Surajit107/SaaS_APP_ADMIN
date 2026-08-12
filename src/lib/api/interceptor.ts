import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

import type {
  ErrorResponseData,
  ExtendedAxiosRequestConfig,
  RefreshSubscriberCallback,
  RefreshTokenResponse,
} from '@/lib/api/types';

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

let isRefreshing = false;
let refreshSubscribers: RefreshSubscriberCallback[] = [];

const deleteCookie = (name: string): void => {
  try {
    const past = 'Thu, 01 Jan 1970 00:00:00 GMT';
    const base = window.location.hostname;
    const parts = base.split('.');
    const registrable = parts.length >= 2 ? parts.slice(-2).join('.') : base;

    document.cookie = `${name}=; Max-Age=0; path=/`;
    document.cookie = `${name}=; expires=${past}; path=/`;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=.${registrable}`;
    document.cookie = `${name}=; expires=${past}; path=/; domain=.${registrable}`;
  } catch {
    /* ignore */
  }
};

const clearAuthArtifacts = (instance: AxiosInstance): void => {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem('user');
    localStorage.removeItem('isOTPVerified');
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    deleteCookie('user');
    deleteCookie('isOTPVerified');
    sessionStorage.clear();

    const common = instance.defaults.headers.common as Record<string, unknown>;
    delete common.Authorization;
  } catch {
    /* ignore */
  }
};

const normalizeMessage = (data: ErrorResponseData | undefined): string => {
  const raw = data?.message;
  if (Array.isArray(raw)) return raw.join(', ');
  if (typeof raw === 'string') return raw;
  return '';
};

const onRefreshed = (token: string): void => {
  refreshSubscribers.forEach((cb) => {
    cb(token);
  });
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: RefreshSubscriberCallback): void => {
  refreshSubscribers.push(callback);
};

function isRefreshEndpoint(config: InternalAxiosRequestConfig): boolean {
  return (config.url ?? '').toString().includes('/auth/refresh');
}

/**
 * Endpoints reached *before* a session exists. A 401 from these is the answer
 * itself (wrong password, wrong code, dead challenge), so it must surface to the
 * caller rather than kick off a refresh-and-retry.
 */
function isAuthCredentialsEndpoint(baseUrlUrl: string): boolean {
  return (
    baseUrlUrl.includes('/auth/login') ||
    baseUrlUrl.includes('/auth/register') ||
    baseUrlUrl.includes('/auth/verify-email') ||
    baseUrlUrl.includes('/auth/mfa/verify')
  );
}

function sentWithBearer(config: ExtendedAxiosRequestConfig): boolean {
  const h = config.headers;
  if (!h) return false;
  if (typeof h.get === 'function') {
    const v = h.get('Authorization');
    return typeof v === 'string' && /^Bearer\s+/i.test(v);
  }
  const raw = (h as Record<string, unknown>).Authorization;
  return typeof raw === 'string' && /^Bearer\s+/i.test(raw);
}

export const setupInterceptors = (client: AxiosInstance): void => {
  client.interceptors.request.use(
    (config): InternalAxiosRequestConfig => {
      if (isRefreshEndpoint(config)) return config;

      const access = localStorage.getItem(ACCESS_KEY);
      if (access?.length && typeof config.headers?.set === 'function') {
        config.headers.set('Authorization', `Bearer ${access}`);
      }
      return config;
    },
    (error: AxiosError) =>
      Promise.reject(error instanceof Error ? error : new Error(String(error))),
  );

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ErrorResponseData>): Promise<AxiosResponse | never> => {
      const original = error.config as ExtendedAxiosRequestConfig | undefined;
      const status = error.response?.status;

      if (!original || status !== 401) {
        return Promise.reject(error);
      }

      const path = `${original.baseURL ?? ''}${original.url ?? ''}`;
      const pathOnly = `${original.url ?? ''}`;

      if (path.includes('/auth/refresh') || pathOnly.includes('/auth/refresh')) {
        clearAuthArtifacts(client);
        return Promise.reject(error);
      }

      if (isAuthCredentialsEndpoint(path) || isAuthCredentialsEndpoint(pathOnly)) {
        return Promise.reject(error);
      }

      const msgLc = normalizeMessage(error.response?.data).toLowerCase();
      if (msgLc.includes('invalid credential')) {
        return Promise.reject(error);
      }

      /** Only replay when the original outbound call carried an access JWT */
      const hadBearerHint = sentWithBearer(original) || /^Bearer\s+/i.test(
        String(
          typeof original.headers?.get === 'function'
            ? original.headers.get('Authorization')
            : (original.headers as Record<string, unknown>)?.Authorization ?? '',
        ),
      );

      if (!hadBearerHint) {
        return Promise.reject(error);
      }

      /* Match example style: recognizable anonymous / expired errors */
      const tokenStaleHint =
        !msgLc ||
        msgLc.includes('jwt') ||
        msgLc.includes('expired') ||
        msgLc === 'unauthorized' ||
        msgLc === 'unauthorized request';

      if (!tokenStaleHint || original._retry) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          addRefreshSubscriber((nextAccess: string) => {
            if (original.headers && typeof original.headers.set === 'function') {
              original.headers.set('Authorization', `Bearer ${nextAccess}`);
            }
            void client(original).then(resolve).catch(reject);
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem(REFRESH_KEY);
        const refreshPayload =
          refreshToken?.length === 0 || refreshToken == null
            ? {}
            : { refreshToken };

        const { data } = await client.post<RefreshTokenResponse>(
          '/auth/refresh',
          refreshPayload,
        );

        const session = data.data;
        if (!session?.accessToken) {
          throw new Error('Refresh response missing session');
        }

        localStorage.setItem(ACCESS_KEY, session.accessToken);
        if (session.refreshToken?.length) {
          localStorage.setItem(REFRESH_KEY, session.refreshToken);
        }

        (
          client.defaults.headers.common as { Authorization?: string }
        ).Authorization = `Bearer ${session.accessToken}`;

        if (original.headers?.set) {
          original.headers.set(
            'Authorization',
            `Bearer ${session.accessToken}`,
          );
        }

        onRefreshed(session.accessToken);
        isRefreshing = false;

        return client(original as InternalAxiosRequestConfig);
      } catch (e) {
        isRefreshing = false;
        refreshSubscribers.splice(0);
        clearAuthArtifacts(client);
        window.location.href = '/';
        return Promise.reject(e instanceof Error ? e : new Error(String(e)));
      }
    },
  );
};
