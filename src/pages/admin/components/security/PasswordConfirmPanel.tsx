import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isCompleteBackupCode, isCompleteTotpCode } from '@/lib/auth/mfa';

export interface PasswordConfirmValues {
  password: string;
  code: string;
}

interface PasswordConfirmPanelProps {
  idPrefix: string;
  description: string;
  submitLabel: string;
  pendingLabel: string;
  destructive?: boolean;
  /** Also ask for a current second factor — a stolen session must not be enough. */
  requireCode: boolean;
  isSubmitting: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (values: PasswordConfirmValues) => void;
}

/** Re-authentication step in front of changes that weaken account security. */
export function PasswordConfirmPanel({
  idPrefix,
  description,
  submitLabel,
  pendingLabel,
  destructive = false,
  requireCode,
  isSubmitting,
  error,
  onCancel,
  onSubmit,
}: PasswordConfirmPanelProps) {
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const passwordFieldId = `${idPrefix}-password`;
  const codeFieldId = `${idPrefix}-code`;
  const errorId = `${idPrefix}-err`;

  const isCodeAcceptable =
    !requireCode || isCompleteTotpCode(code) || isCompleteBackupCode(code);
  const canSubmit = password.length > 0 && isCodeAcceptable && !isSubmitting;

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) {
          onSubmit({ password, code });
        }
      }}
    >
      <p className="text-muted-foreground text-sm">{description}</p>

      <div className="space-y-2">
        <label
          className="text-foreground block text-xs font-medium"
          htmlFor={passwordFieldId}
        >
          Current password
        </label>
        <Input
          aria-describedby={error !== null ? errorId : undefined}
          aria-invalid={error !== null}
          autoComplete="current-password"
          autoFocus
          disabled={isSubmitting}
          id={passwordFieldId}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          placeholder="••••••••"
          type="password"
          value={password}
        />
      </div>

      {requireCode ? (
        <div className="space-y-2">
          <label
            className="text-foreground block text-xs font-medium"
            htmlFor={codeFieldId}
          >
            Authenticator or recovery code
          </label>
          <Input
            autoComplete="one-time-code"
            className="font-mono tracking-wide"
            disabled={isSubmitting}
            id={codeFieldId}
            maxLength={20}
            onChange={(event) => {
              setCode(event.target.value);
            }}
            placeholder="123456 or XXXX-XXXX-XXXX"
            type="text"
            value={code}
          />
        </div>
      ) : null}

      {error !== null ? (
        <p className="text-destructive text-xs" id={errorId} role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          disabled={!canSubmit}
          size="lg"
          type="submit"
          variant={destructive ? 'destructive' : 'default'}
        >
          {isSubmitting ? pendingLabel : submitLabel}
        </Button>
        <Button
          disabled={isSubmitting}
          onClick={onCancel}
          size="lg"
          type="button"
          variant="ghost"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
