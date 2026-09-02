import { zodResolver } from '@hookform/resolvers/zod';
import { Crown, Eye, EyeClosed, KeyRound, Mail } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate } from 'react-router-dom';

import { AuthCardTopHome } from '@/components/auth/AuthCardTopHome';
import { Button } from '@/components/ui/button';
import { AdminAuthPortalFooter } from '@/pages/admin/components/AdminAuthPortalFooter';
import { AdminMfaChallengeSection } from '@/pages/admin/components/AdminMfaChallengeSection';
import {
  adminLoginCodeRequested,
  adminLoginRequested,
} from '@/features/admin/saga/adminAuthSaga';
import { clearError } from '@/features/admin/slice/adminAuthSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authInputClassName } from '@/lib/validation/authFieldStyles';
import {
  type LoginFormValues,
  loginEmailSchema,
  loginSchema,
} from '@/lib/validation/authSchemas';

type LoginMethodStep = 'identify' | 'choose' | 'password';

export function AdminLoginPage() {
  const dispatch = useAppDispatch();
  const {
    isAuthenticated,
    isLoading,
    error,
    mfaChallenge,
    isLoginCodeRequestPending,
  } = useAppSelector((s) => s.adminAuth);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [step, setStep] = useState<LoginMethodStep>('identify');
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const { ref: emailRegisterRef, ...emailField } = register('email');
  const { ref: passwordRegisterRef, ...passwordField } = register('password');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (error === null) {
      return undefined;
    }

    const subscription = watch(() => {
      dispatch(clearError());
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, error, watch]);

  useEffect(() => {
    if (mfaChallenge !== null) {
      return;
    }
    if (step === 'identify') {
      emailInputRef.current?.focus();
      return;
    }
    if (step === 'password') {
      passwordInputRef.current?.focus();
    }
  }, [mfaChallenge, step]);

  if (isAuthenticated) {
    return <Navigate replace to="/admin/dashboard" />;
  }

  const emailValue = watch('email');
  const isAwaitingSecondFactor = mfaChallenge !== null;
  const isBusy = isSubmitting || isLoading || isLoginCodeRequestPending;
  const { title, subtitle } = headingCopy(step, mfaChallenge);

  const goToIdentify = (): void => {
    setValue('password', '');
    setIsPasswordVisible(false);
    setStep('identify');
    dispatch(clearError());
  };

  const continueFromEmail = (): void => {
    const parsed = loginEmailSchema.safeParse({ email: getValues('email') });
    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? 'Enter a valid email address';
      setError('email', { type: 'manual', message });
      return;
    }
    setValue('email', parsed.data.email);
    dispatch(clearError());
    setStep('choose');
  };

  const requestLoginCode = (): void => {
    const email = emailValue.trim();
    if (!isEmailLike(email)) {
      return;
    }
    dispatch(adminLoginCodeRequested({ email }));
  };

  const onPasswordSubmit = (values: LoginFormValues): void => {
    dispatch(adminLoginRequested(values));
  };

  return (
    <div className="from-primary/10 via-background to-background relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-gradient-to-b px-4 py-3 sm:py-4">
      <div aria-hidden className="bg-primary/25 absolute -left-20 top-16 h-52 w-52 rounded-full blur-3xl" />
      <div aria-hidden className="bg-primary/15 absolute -right-16 bottom-10 h-44 w-44 rounded-full blur-3xl" />
      <div className="border-primary/20 relative w-full max-w-xl overflow-hidden rounded-2xl border bg-card shadow-lg shadow-black/5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.16] via-primary/[0.05] to-transparent"
        />
        <AuthCardTopHome />
        <div className="relative z-10 px-4 pb-3 pt-4 text-center sm:px-8 sm:pb-4 sm:pt-5">
          <div className="bg-primary/10 text-primary mx-auto mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] sm:mb-3 sm:py-1 sm:text-[11px]">
            <Crown size={14} strokeWidth={2} />
            Platform owner
          </div>
          <h1 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h1>
          <p className="text-muted-foreground mx-auto mt-1 max-w-md text-xs leading-snug sm:text-sm">
            {subtitle}
          </p>
        </div>
        {isAwaitingSecondFactor ? (
          <AdminMfaChallengeSection />
        ) : (
          <form
            className="relative z-10 space-y-3 px-4 pb-3 sm:px-8"
            noValidate
            onSubmit={
              step === 'password'
                ? handleSubmit(onPasswordSubmit)
                : (event) => {
                    event.preventDefault();
                    if (step === 'identify') {
                      continueFromEmail();
                    }
                  }
            }
          >
            <div className="block space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <label
                  className="text-foreground text-xs font-medium"
                  htmlFor="admin-login-email"
                >
                  Work email
                </label>
                {step !== 'identify' ? (
                  <button
                    aria-label="Use a different email"
                    className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer text-xs hover:underline"
                    onClick={goToIdentify}
                    type="button"
                  >
                    Change
                  </button>
                ) : null}
              </div>
              <input
                id="admin-login-email"
                autoComplete="username"
                className={`${authInputClassName(!!errors.email)} ${
                  step === 'identify' ? '' : 'bg-muted/40'
                }`}
                placeholder="you@company.com"
                type="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'admin-login-email-err' : undefined}
                readOnly={step !== 'identify'}
                {...emailField}
                ref={(element) => {
                  emailRegisterRef(element);
                  emailInputRef.current = element;
                }}
              />
              {errors.email ? (
                <p id="admin-login-email-err" className="text-destructive text-xs" role="alert">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            {step === 'identify' ? (
              <Button className="mt-1 w-full" disabled={isBusy} size="default" type="submit">
                Continue
              </Button>
            ) : null}

            {step === 'choose' ? (
              <div className="space-y-3 pt-1">
                <p className="text-foreground text-sm font-medium">
                  How do you want to sign in?
                </p>
                <Button
                  className="w-full gap-2"
                  disabled={isBusy}
                  onClick={() => {
                    setValue('password', '');
                    setStep('password');
                    dispatch(clearError());
                  }}
                  size="default"
                  type="button"
                >
                  <KeyRound aria-hidden className="size-4 shrink-0" />
                  Continue with password
                </Button>
                <Button
                  className="w-full gap-2"
                  disabled={isBusy}
                  onClick={requestLoginCode}
                  type="button"
                  variant="outline"
                >
                  <Mail aria-hidden className="size-4 shrink-0" />
                  {isLoginCodeRequestPending
                    ? 'Sending code...'
                    : 'Email me a sign-in code'}
                </Button>
                <p className="text-muted-foreground text-center text-xs">
                  The emailed code is a one-time password. No password needed.
                </p>
              </div>
            ) : null}

            {step === 'password' ? (
              <>
                <div className="block space-y-2">
                  <label
                    className="text-foreground block text-xs font-medium"
                    htmlFor="admin-login-password"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="admin-login-password"
                      autoComplete="current-password"
                      className={`${authInputClassName(!!errors.password)} pr-11`}
                      placeholder="••••••••"
                      type={isPasswordVisible ? 'text' : 'password'}
                      aria-invalid={!!errors.password}
                      aria-describedby={
                        errors.password ? 'admin-login-password-err' : undefined
                      }
                      {...passwordField}
                      ref={(element) => {
                        passwordRegisterRef(element);
                        passwordInputRef.current = element;
                      }}
                    />
                    <button
                      aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1 transition-colors"
                      onClick={() => setIsPasswordVisible((previous) => !previous)}
                      type="button"
                    >
                      {isPasswordVisible ? (
                        <EyeClosed size={16} strokeWidth={1.8} />
                      ) : (
                        <Eye size={16} strokeWidth={1.8} />
                      )}
                    </button>
                  </div>
                  {errors.password ? (
                    <p
                      id="admin-login-password-err"
                      className="text-destructive text-xs"
                      role="alert"
                    >
                      {errors.password.message}
                    </p>
                  ) : null}
                </div>
                <Button
                  className="mt-1 w-full"
                  disabled={isBusy}
                  size="default"
                  type="submit"
                >
                  {isLoading ? 'Signing in...' : 'Enter dashboard'}
                </Button>
                <Button
                  className="w-full gap-2"
                  disabled={isBusy}
                  onClick={requestLoginCode}
                  type="button"
                  variant="outline"
                >
                  <Mail aria-hidden className="size-4 shrink-0" />
                  {isLoginCodeRequestPending
                    ? 'Sending code...'
                    : 'Email me a sign-in code instead'}
                </Button>
              </>
            ) : null}

            {error ? (
              <p className="text-destructive text-xs" role="alert">
                {error}
              </p>
            ) : null}
          </form>
        )}

        <AdminAuthPortalFooter />
      </div>
    </div>
  );
}

function headingCopy(
  step: LoginMethodStep,
  mfaChallenge: { methods: string[] } | null,
): { title: string; subtitle: string } {
  if (mfaChallenge !== null) {
    return {
      title: 'Confirm it is you',
      subtitle: mfaChallenge.methods.includes('email_code')
        ? 'Enter the code we emailed you to open the console.'
        : 'Your password checked out. Enter your second factor to open the console.',
    };
  }
  if (step === 'choose') {
    return {
      title: 'How do you want to sign in?',
      subtitle: 'Use your password, or get a one-time code in your inbox.',
    };
  }
  if (step === 'password') {
    return {
      title: 'Enter your password',
      subtitle: 'Then we will ask for your authenticator if it is turned on.',
    };
  }
  return {
    title: 'Sign in to the owner console',
    subtitle: 'Manage tenants, platform health, and product delivery.',
  };
}

function isEmailLike(value: string | undefined): value is string {
  return typeof value === 'string' && /^\S+@\S+\.\S+$/.test(value.trim());
}
