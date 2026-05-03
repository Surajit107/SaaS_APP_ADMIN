const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export function storeAuthTokens(
  accessToken: string,
  refreshToken: string,
): void {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function getRefreshToken(): string | null {
  const token = localStorage.getItem(REFRESH_KEY);
  return token !== null && token.length > 0 ? token : null;
}

export function clearAuthStorage(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  sessionStorage.clear();
}
