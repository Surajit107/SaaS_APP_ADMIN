import { useEffect, useRef, useState } from 'react';

import { TOTP_CODE_LENGTH } from '@/lib/auth/mfa';
import { cn } from '@/lib/utils';

interface OtpCodeInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** Fired once the field fills up, so the user rarely has to press a button. */
  onComplete?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  'aria-describedby'?: string;
  'aria-label'?: string;
  className?: string;
}

const SLOT_INDEXES = Array.from(
  { length: TOTP_CODE_LENGTH },
  (_unused, index) => index,
);

/**
 * Six-box display for a 6-digit authenticator code.
 *
 * The boxes are presentational: a single transparent input sits on top of them
 * so browser and password-manager autofill of `one-time-code`, paste and mobile
 * keyboards keep working, which is where most of these codes come from.
 */
export function OtpCodeInput({
  id,
  value,
  onChange,
  onComplete,
  disabled = false,
  invalid = false,
  autoFocus = false,
  className,
  ...aria
}: OtpCodeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const completedRef = useRef<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (value.length < TOTP_CODE_LENGTH) {
      completedRef.current = null;
      return;
    }
    // Guard against re-firing for a value the parent has already been handed.
    if (completedRef.current === value) {
      return;
    }
    completedRef.current = value;
    onComplete?.(value);
  }, [value, onComplete]);

  /** Digits only ever append or delete from the end, so pin the caret there. */
  const keepCaretAtEnd = (): void => {
    const input = inputRef.current;
    if (input === null) {
      return;
    }
    const end = input.value.length;
    if (input.selectionStart !== end || input.selectionEnd !== end) {
      input.setSelectionRange(end, end);
    }
  };

  const activeIndex = Math.min(value.length, TOTP_CODE_LENGTH - 1);

  return (
    <div className={cn('relative w-full', className)}>
      <input
        aria-invalid={invalid}
        autoComplete="one-time-code"
        autoFocus={autoFocus}
        className={cn(
          'absolute inset-0 z-10 h-full w-full rounded-lg border-0 bg-transparent p-0 text-transparent caret-transparent outline-none',
          'selection:bg-transparent selection:text-transparent',
          disabled ? 'cursor-not-allowed' : 'cursor-text',
        )}
        disabled={disabled}
        id={id}
        inputMode="numeric"
        maxLength={TOTP_CODE_LENGTH}
        onBlur={() => {
          setIsFocused(false);
        }}
        onChange={(event) => {
          onChange(
            event.target.value.replace(/\D/g, '').slice(0, TOTP_CODE_LENGTH),
          );
        }}
        onFocus={() => {
          setIsFocused(true);
          keepCaretAtEnd();
        }}
        onSelect={keepCaretAtEnd}
        pattern="\d*"
        type="text"
        value={value}
        {...aria}
      />

      <div aria-hidden className="pointer-events-none flex w-full items-center gap-2">
        {SLOT_INDEXES.map((index) => {
          const digit = value[index] ?? '';
          const isActive = isFocused && !disabled && index === activeIndex;

          return (
            <div
              className={cn(
                'border-input bg-background text-foreground relative flex h-12 min-w-0 flex-1 items-center justify-center rounded-lg border font-mono text-xl shadow-xs transition-[color,box-shadow,border-color]',
                isActive && 'border-ring ring-ring/35 z-10 ring-[3px]',
                invalid && 'border-destructive',
                invalid && isActive && 'ring-destructive/30',
                disabled && 'opacity-60',
              )}
              key={index}
            >
              {digit !== '' ? (
                digit
              ) : isActive ? (
                <span className="bg-foreground otp-caret-blink h-5 w-px" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
