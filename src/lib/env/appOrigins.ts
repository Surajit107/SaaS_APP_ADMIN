/**
 * Tenant/main marketing app origin for cross-app navigation when the operator
 * console is served separately (e.g. `http://localhost:5173`). Empty means same
 * origin — use a reverse proxy that routes `/tenant/*` to the main SPA.
 */
export function mainAppOrigin(): string {
  const raw = import.meta.env.VITE_MAIN_APP_ORIGIN;
  return typeof raw === 'string' ? raw.trim().replace(/\/$/, '') : '';
}

export function mainAppPath(pathname: string): string {
  const o = mainAppOrigin();
  const p = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return o ? `${o}${p}` : p;
}
