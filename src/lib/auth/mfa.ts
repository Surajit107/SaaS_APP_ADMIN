import type { LoginResultData, MfaRequiredData } from '@/lib/api/types';

/** Digits in an authenticator code. */
export const TOTP_CODE_LENGTH = 6;

/** Characters in a recovery code, ignoring the display grouping. */
const BACKUP_CODE_LENGTH = 12;

/**
 * `/auth/login` returns a session or a challenge under the same `data` key, so
 * callers must narrow before touching either shape.
 */
export function isMfaRequiredResult(
  result: LoginResultData,
): result is MfaRequiredData {
  return 'mfaRequired' in result && result.mfaRequired === true;
}

/** Strips grouping and case, matching how the server hashes recovery codes. */
export function normalizeBackupCode(code: string): string {
  return code.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
}

export function isCompleteTotpCode(code: string): boolean {
  return new RegExp(`^\\d{${TOTP_CODE_LENGTH}}$`).test(code);
}

export function isCompleteBackupCode(code: string): boolean {
  return normalizeBackupCode(code).length === BACKUP_CODE_LENGTH;
}
