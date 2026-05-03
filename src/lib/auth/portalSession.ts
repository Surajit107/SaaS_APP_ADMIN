const ADMIN_KEY = 'saas:portalSession:admin';
const TENANT_KEY = 'saas:portalSession:tenant';

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

function safeRead<T>(raw: string | null, guard: (v: unknown) => v is T): T | null {
  if (raw == null || raw === '') {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return guard(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export interface PersistedAdminSession {
  isAuthenticated: boolean;
  email: string | null;
}

export interface PersistedTenantSession {
  isAuthenticated: boolean;
  email: string | null;
  organizationName: string | null;
}

const isPersistedAdmin = (v: unknown): v is PersistedAdminSession =>
  isRecord(v) &&
  typeof v.isAuthenticated === 'boolean' &&
  (v.email === null || typeof v.email === 'string');

const isPersistedTenant = (v: unknown): v is PersistedTenantSession =>
  isRecord(v) &&
  typeof v.isAuthenticated === 'boolean' &&
  (v.email === null || typeof v.email === 'string') &&
  (v.organizationName === null || typeof v.organizationName === 'string');

export function loadAdminSession(): PersistedAdminSession {
  const data = safeRead(sessionStorage.getItem(ADMIN_KEY), isPersistedAdmin);
  if (data?.isAuthenticated === true && typeof data.email === 'string' && data.email.length > 0) {
    return { isAuthenticated: true, email: data.email };
  }
  return { isAuthenticated: false, email: null };
}

export function loadTenantSession(): PersistedTenantSession {
  const data = safeRead(sessionStorage.getItem(TENANT_KEY), isPersistedTenant);
  if (data?.isAuthenticated === true && typeof data.email === 'string' && data.email.length > 0) {
    return {
      isAuthenticated: true,
      email: data.email,
      organizationName:
        typeof data.organizationName === 'string' ? data.organizationName : null,
    };
  }
  return { isAuthenticated: false, email: null, organizationName: null };
}

export function persistAdminSession(session: PersistedAdminSession): void {
  try {
    if (session.isAuthenticated && session.email) {
      sessionStorage.setItem(ADMIN_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(ADMIN_KEY);
    }
  } catch {
    /* ignore quota / private mode */
  }
}

export function persistTenantSession(session: PersistedTenantSession): void {
  try {
    if (session.isAuthenticated && session.email) {
      sessionStorage.setItem(TENANT_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(TENANT_KEY);
    }
  } catch {
    /* ignore */
  }
}
