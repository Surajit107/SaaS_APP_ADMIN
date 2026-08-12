import { useState } from 'react';
import { Copy, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

import { OtpCodeInput } from '@/components/auth/OtpCodeInput';
import { Button } from '@/components/ui/button';
import { isCompleteTotpCode } from '@/lib/auth/mfa';
import type { TotpEnrollmentData } from '@/lib/api/types';

interface TotpEnrollmentPanelProps {
  enrollment: TotpEnrollmentData;
  isEnabling: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: (code: string) => void;
}

/**
 * Enrollment step two: prove the authenticator app holds the secret before
 * anything starts being enforced on the account.
 */
export function TotpEnrollmentPanel({
  enrollment,
  isEnabling,
  error,
  onCancel,
  onConfirm,
}: TotpEnrollmentPanelProps) {
  const [code, setCode] = useState('');
  const [isSecretVisible, setIsSecretVisible] = useState(false);

  const canSubmit = isCompleteTotpCode(code) && !isEnabling;

  const copySecret = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(enrollment.secret);
      toast.success('Setup key copied');
    } catch {
      toast.error('Could not copy — select the key and copy it manually');
    }
  };

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) {
          onConfirm(code);
        }
      }}
    >
      <ol className="text-muted-foreground space-y-1 text-sm">
        <li>1. Open your authenticator app and scan this QR code.</li>
        <li>2. Enter the 6-digit code it shows to finish.</li>
      </ol>

      <div className="flex justify-center">
        <img
          alt="QR code for authenticator app enrollment"
          className="border-border size-44 rounded-xl border bg-white p-2"
          src={enrollment.qrCodeDataUrl}
        />
      </div>

      <div className="text-center">
        {!isSecretVisible ? (
          <Button
            className="h-7 px-2 text-xs"
            onClick={() => {
              setIsSecretVisible(true);
            }}
            type="button"
            variant="ghost"
          >
            <KeyRound aria-hidden className="size-3 shrink-0" />
            Can&apos;t scan? Enter a key instead
          </Button>
        ) : (
          <div className="border-border bg-muted/40 space-y-2 rounded-lg border p-3 text-left">
            <p className="text-muted-foreground text-xs">
              Enter this key in your authenticator app manually.
            </p>
            <div className="flex items-center gap-2">
              <code className="text-foreground min-w-0 flex-1 break-all font-mono text-xs">
                {enrollment.secret}
              </code>
              <Button
                aria-label="Copy setup key"
                onClick={() => {
                  void copySecret();
                }}
                size="icon-sm"
                type="button"
                variant="outline"
              >
                <Copy aria-hidden />
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label
          className="text-foreground block text-xs font-medium"
          htmlFor="admin-security-enroll-code"
        >
          Code from your authenticator app
        </label>
        <OtpCodeInput
          aria-describedby={error !== null ? 'admin-security-enroll-err' : undefined}
          autoFocus
          disabled={isEnabling}
          id="admin-security-enroll-code"
          invalid={error !== null}
          onChange={setCode}
          onComplete={onConfirm}
          value={code}
        />
        {error !== null ? (
          <p
            className="text-destructive text-xs"
            id="admin-security-enroll-err"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button disabled={!canSubmit} size="lg" type="submit">
          {isEnabling ? 'Turning on…' : 'Confirm and turn on'}
        </Button>
        <Button
          disabled={isEnabling}
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
