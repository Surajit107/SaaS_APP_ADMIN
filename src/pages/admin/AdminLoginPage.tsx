import { zodResolver } from '@hookform/resolvers/zod';
import { Crown, Eye, EyeClosed, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
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
  loginSchema,
} from '@/lib/validation/authSchemas';

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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

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

  if (isAuthenticated) {
    return <Navigate replace to="/admin/dashboard" />;
  }

  const onSubmit = (values: LoginFormValues) => dispatch(adminLoginRequested(values));
  const isAwaitingSecondFactor = mfaChallenge !== null;

  const emailValue = watch('email');
  const canRequestLoginCode = isEmailLike(emailValue);

  const requestLoginCode = (): void => {
    if (!canRequestLoginCode) {
      return;
    }
    dispatch(adminLoginCodeRequested({ email: emailValue.trim() }));
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
            {isAwaitingSecondFactor
              ? 'Confirm it is you'
              : 'Sign in to the owner console'}
          </h1>
          <p className="text-muted-foreground mx-auto mt-1 max-w-md text-xs leading-snug sm:text-sm">
            {isAwaitingSecondFactor
              ? mfaChallenge.methods.includes('email_code')
                ? 'Enter the code we emailed you to open the console.'
                : 'Your password checked out. Enter your second factor to open the console.'
              : 'Manage tenants, platform health, and product delivery.'}
          </p>
        </div>
        {isAwaitingSecondFactor ? <AdminMfaChallengeSection /> : (
        <form
          className="relative z-10 space-y-3 px-4 pb-3 sm:px-8"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="block space-y-2">
            <label className="text-foreground block text-xs font-medium" htmlFor="admin-login-email">
              Work email
            </label>
            <input
              id="admin-login-email"
              autoComplete="email"
              className={authInputClassName(!!errors.email)}
              placeholder="you@company.com"
              type="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'admin-login-email-err' : undefined}
              {...register('email')}
            />
            {errors.email ? (
              <p id="admin-login-email-err" className="text-destructive text-xs" role="alert">
                {errors.email.message}
              </p>
            ) : null}
          </div>
          <div className="block space-y-2">
            <label className="text-foreground block text-xs font-medium" htmlFor="admin-login-password">
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
                aria-describedby={errors.password ? 'admin-login-password-err' : undefined}
                {...register('password')}
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
              <p id="admin-login-password-err" className="text-destructive text-xs" role="alert">
                {errors.password.message}
              </p>
            ) : null}
          </div>
          <Button
            className="mt-1 w-full"
            disabled={isSubmitting || isLoading}
            size="default"
            type="submit"
          >
            {isLoading ? 'Signing in...' : 'Enter dashboard'}
          </Button>
          {error ? (
            <p className="text-destructive text-xs" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex items-center gap-3 pt-1">
            <span className="bg-border h-px flex-1" aria-hidden />
            <span className="text-muted-foreground text-[11px] uppercase tracking-wider">
              or
            </span>
            <span className="bg-border h-px flex-1" aria-hidden />
          </div>
          <Button
            className="w-full gap-2"
            disabled={
              !canRequestLoginCode || isLoginCodeRequestPending || isLoading
            }
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
            {canRequestLoginCode
              ? 'We will send a 6-digit code to that address. No password needed.'
              : 'Enter your email above to sign in with a one-time code instead.'}
          </p>
        </form>
        )}

        <AdminAuthPortalFooter />
      </div>
    </div>
  );
}

/** Cheap client-side gate for the code button; the server still validates. */
function isEmailLike(value: string | undefined): value is string {
  return typeof value === 'string' && /^\S+@\S+\.\S+$/.test(value.trim());
}
