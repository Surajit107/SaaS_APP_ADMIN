import { KeyRound, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

import { OtpCodeInput } from '@/components/auth/OtpCodeInput';
import { Button } from '@/components/ui/button';
import { adminMfaVerifyRequested } from '@/features/admin/saga/adminAuthSaga';
import {
  clearMfaError,
  mfaChallengeAbandoned,
} from '@/features/admin/slice/adminAuthSlice';
import {
  isCompleteBackupCode,
  isCompleteTotpCode,
  normalizeBackupCode,
} from '@/lib/auth/mfa';
import { authInputClassName } from '@/lib/validation/authFieldStyles';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

function formatCountdown(msRemaining: number): string {
  const totalSeconds = Math.max(0, Math.ceil(msRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes)}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Step two of the owner-console sign-in: the password was accepted and the
 * server is holding a short-lived challenge until a second factor arrives.
 */
export function AdminMfaChallengeSection() {
  const dispatch = useAppDispatch();
  const { mfaChallenge, isMfaVerifying, mfaError } = useAppSelector(
    (s) => s.adminAuth,
  );
  const [isUsingBackupCode, setIsUsingBackupCode] = useState(false);
  const [code, setCode] = useState('');
  // Re-read the clock on a timer rather than during render, so the countdown
  // below is derived from state instead of an impure call.
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  if (mfaChallenge === null) {
    return null;
  }

  // An emailed code stands alone: there is no authenticator or recovery code to
  // fall back to, so the method switcher has nothing to offer.
  const isEmailCodeChallenge = mfaChallenge.methods.includes('email_code');
  const msRemaining = new Date(mfaChallenge.expiresAt).getTime() - nowMs;
  const isExpired = msRemaining <= 0;
  const canSubmit = isUsingBackupCode
    ? isCompleteBackupCode(code)
    : isCompleteTotpCode(code);

  const submit = (value: string): void => {
    if (isExpired || isMfaVerifying) {
      return;
    }
    dispatch(
      adminMfaVerifyRequested({
        code: isUsingBackupCode ? normalizeBackupCode(value) : value,
      }),
    );
  };

  const switchMethod = (): void => {
    setIsUsingBackupCode((previous) => !previous);
    setCode('');
    if (mfaError !== null) {
      dispatch(clearMfaError());
    }
  };

  return (
    <div className="relative z-10 space-y-3 px-4 pb-3 sm:px-8">
      <div className="border-primary/20 bg-primary/5 flex items-start gap-3 rounded-lg border px-3 py-2.5">
        <span className="text-primary mt-0.5">
          <ShieldCheck aria-hidden size={18} strokeWidth={1.9} />
        </span>
        <div className="min-w-0 space-y-0.5">
          <p className="text-foreground text-xs font-semibold">
            {isEmailCodeChallenge
              ? 'We emailed you a sign-in code'
              : 'Two-factor authentication required'}
          </p>
          <p className="text-muted-foreground truncate text-xs">
            {mfaChallenge.email}
          </p>
        </div>
      </div>

      <form
        className="space-y-3"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (canSubmit) {
            submit(code);
          }
        }}
      >
        <div className="space-y-2">
          <label
            className="text-foreground block text-xs font-medium"
            htmlFor="admin-mfa-code"
          >
            {isUsingBackupCode
              ? 'Recovery code'
              : isEmailCodeChallenge
                ? 'Code from your email'
                : 'Code from your authenticator app'}
          </label>
          {isUsingBackupCode ? (
            <input
              aria-describedby={mfaError ? 'admin-mfa-err' : undefined}
              aria-invalid={mfaError !== null}
              autoComplete="one-time-code"
              autoFocus
              className={`${authInputClassName(mfaError !== null)} font-mono tracking-[0.2em]`}
              disabled={isMfaVerifying || isExpired}
              id="admin-mfa-code"
              onChange={(event) => {
                setCode(event.target.value.toUpperCase());
              }}
              placeholder="XXXX-XXXX-XXXX"
              type="text"
              value={code}
            />
          ) : (
            <OtpCodeInput
              aria-describedby={mfaError ? 'admin-mfa-err' : undefined}
              autoFocus
              disabled={isMfaVerifying || isExpired}
              id="admin-mfa-code"
              invalid={mfaError !== null}
              onChange={setCode}
              onComplete={submit}
              value={code}
            />
          )}
          <p className="text-muted-foreground text-xs">
            {isExpired
              ? 'This sign-in attempt expired. Enter your password again to get a new code prompt.'
              : `Expires in ${formatCountdown(msRemaining)}`}
          </p>
        </div>

        {mfaError ? (
          <p className="text-destructive text-xs" id="admin-mfa-err" role="alert">
            {mfaError}
          </p>
        ) : null}

        <Button
          className="w-full"
          disabled={!canSubmit || isMfaVerifying || isExpired}
          size="default"
          type="submit"
        >
          {isMfaVerifying ? 'Verifying...' : 'Verify and continue'}
        </Button>
      </form>

      <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
        {isEmailCodeChallenge ? (
          <span className="text-muted-foreground text-xs">
            The code works once and only for this sign-in.
          </span>
        ) : (
          <button
            className="text-primary inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium hover:underline"
            onClick={switchMethod}
            type="button"
          >
            <KeyRound aria-hidden size={13} strokeWidth={1.9} />
            {isUsingBackupCode
              ? 'Use your authenticator app'
              : 'Use a recovery code instead'}
          </button>
        )}
        <button
          className="text-muted-foreground hover:text-foreground cursor-pointer text-xs"
          onClick={() => dispatch(mfaChallengeAbandoned())}
          type="button"
        >
          Sign in as a different account
        </button>
      </div>
    </div>
  );
}
