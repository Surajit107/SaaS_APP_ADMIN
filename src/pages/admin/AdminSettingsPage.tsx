import {
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  SlidersHorizontal,
} from 'lucide-react';
import { useEffect, useState, type ReactElement } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  adminBackupCodesRegenerateRequested,
  adminEmailCodeLoginPreferenceRequested,
  adminMfaStatusSyncRequested,
  adminTotpDisableRequested,
  adminTotpEnableRequested,
  adminTotpSetupRequested,
  issuedBackupCodesDismissed,
  securityPanelReset,
} from '@/features/admin/slice/adminSecuritySlice';
import { AdminUserMfaResetCard } from '@/pages/admin/components/security/AdminUserMfaResetCard';
import { BackupCodesPanel } from '@/pages/admin/components/security/BackupCodesPanel';
import { PasswordConfirmPanel } from '@/pages/admin/components/security/PasswordConfirmPanel';
import { TotpEnrollmentPanel } from '@/pages/admin/components/security/TotpEnrollmentPanel';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

/** Which re-authentication prompt, if any, is standing in front of an action. */
type ConfirmIntent = 'disable' | 'regenerate' | null;

function formatEnabledOn(isoDate: string | null): string | null {
  if (isoDate === null) {
    return null;
  }
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function AdminSettingsPage(): ReactElement {
  const dispatch = useAppDispatch();
  const email = useAppSelector((s) => s.adminAuth.email);
  const {
    status,
    isStatusLoading,
    statusError,
    enrollment,
    isEnrollmentStarting,
    isEnabling,
    isDisabling,
    isRegenerating,
    isPreferenceSaving,
    actionError,
    issuedBackupCodes,
  } = useAppSelector((s) => s.adminSecurity);
  const [confirmIntent, setConfirmIntent] = useState<ConfirmIntent>(null);

  useEffect(() => {
    dispatch(adminMfaStatusSyncRequested());
    return () => {
      dispatch(securityPanelReset());
    };
  }, [dispatch]);

  const isTotpEnabled = status?.isTotpEnabled === true;
  const enabledOn = formatEnabledOn(status?.totpEnabledAt ?? null);
  const codesRemaining = status?.backupCodesRemaining ?? 0;

  const renderSecurityBody = (): ReactElement => {
    if (status === null) {
      return isStatusLoading ? (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 aria-hidden className="size-4 animate-spin" />
          Loading your security settings…
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-destructive text-sm">
            {statusError ?? 'Unable to load your security settings'}
          </p>
          <Button
            onClick={() => dispatch(adminMfaStatusSyncRequested())}
            size="lg"
            type="button"
            variant="outline"
          >
            <RefreshCw aria-hidden />
            Try again
          </Button>
        </div>
      );
    }

    // Fresh codes trump everything: this is the only time they are readable.
    if (issuedBackupCodes !== null) {
      return (
        <BackupCodesPanel
          accountEmail={email}
          codes={issuedBackupCodes}
          onDone={() => {
            setConfirmIntent(null);
            dispatch(issuedBackupCodesDismissed());
          }}
        />
      );
    }

    if (enrollment !== null) {
      return (
        <TotpEnrollmentPanel
          enrollment={enrollment}
          error={actionError}
          isEnabling={isEnabling}
          onCancel={() => dispatch(securityPanelReset())}
          onConfirm={(code) => dispatch(adminTotpEnableRequested({ code }))}
        />
      );
    }

    if (confirmIntent === 'disable') {
      return (
        <PasswordConfirmPanel
          description="Turning two-factor authentication off signs out every session on this account, including this one."
          destructive
          error={actionError}
          idPrefix="admin-security-disable"
          isSubmitting={isDisabling}
          onCancel={() => setConfirmIntent(null)}
          onSubmit={({ password, code }) =>
            dispatch(adminTotpDisableRequested({ password, code }))
          }
          pendingLabel="Turning off…"
          requireCode
          submitLabel="Turn off two-factor"
        />
      );
    }

    if (confirmIntent === 'regenerate') {
      return (
        <PasswordConfirmPanel
          description="New recovery codes replace the current set. Any codes you saved earlier stop working."
          error={actionError}
          idPrefix="admin-security-regenerate"
          isSubmitting={isRegenerating}
          onCancel={() => setConfirmIntent(null)}
          onSubmit={({ password }) =>
            dispatch(adminBackupCodesRegenerateRequested({ password }))
          }
          pendingLabel="Generating…"
          requireCode={false}
          submitLabel="Generate new codes"
        />
      );
    }

    if (!isTotpEnabled) {
      return (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Add a second step to your sign-in using any authenticator app, such
            as Google Authenticator, 1Password, or Authy. Owner-console accounts
            can reach every tenant, so this is strongly recommended.
          </p>
          {actionError !== null ? (
            <p className="text-destructive text-sm" role="alert">
              {actionError}
            </p>
          ) : null}
          <Button
            disabled={isEnrollmentStarting}
            onClick={() => dispatch(adminTotpSetupRequested())}
            size="lg"
            type="button"
          >
            {isEnrollmentStarting ? (
              <Loader2 aria-hidden className="animate-spin" />
            ) : (
              <ShieldCheck aria-hidden />
            )}
            {isEnrollmentStarting ? 'Preparing…' : 'Turn on two-factor'}
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="border-border bg-muted/30 space-y-1 rounded-lg border p-3">
            <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Authenticator app
            </dt>
            <dd className="text-foreground text-sm">
              {enabledOn === null ? 'Active' : `Active since ${enabledOn}`}
            </dd>
          </div>
          <div className="border-border bg-muted/30 space-y-1 rounded-lg border p-3">
            <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Recovery codes
            </dt>
            <dd className="text-foreground text-sm">
              {codesRemaining} unused
              {codesRemaining <= 2 ? ' — generate a new set soon' : ''}
            </dd>
          </div>
        </dl>

        {actionError !== null ? (
          <p className="text-destructive text-sm" role="alert">
            {actionError}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setConfirmIntent('regenerate')}
            size="lg"
            type="button"
            variant="outline"
          >
            <KeyRound aria-hidden />
            Generate new recovery codes
          </Button>
          <Button
            onClick={() => setConfirmIntent('disable')}
            size="lg"
            type="button"
            variant="destructive"
          >
            <ShieldOff aria-hidden />
            Turn off two-factor
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex min-w-0 items-start gap-3">
        <span className="bg-primary/12 text-primary border-primary/20 flex size-10 shrink-0 items-center justify-center rounded-xl border">
          <SlidersHorizontal aria-hidden className="size-5" />
        </span>
        <div className="min-w-0">
          <h1 className="text-foreground text-xl font-bold tracking-tight">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-relaxed">
            Your owner-console account and how you sign in to it.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>The identity behind this console session.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Signed in as
            </p>
            <p className="text-foreground truncate text-sm">
              {email ?? 'Unknown account'}
            </p>
          </div>
          <Badge variant="secondary">Platform admin</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle>Two-factor authentication</CardTitle>
              <CardDescription>
                Require a one-time code from an authenticator app after your
                password.
              </CardDescription>
            </div>
            <Badge variant={isTotpEnabled ? 'default' : 'muted'}>
              {isTotpEnabled ? 'On' : 'Off'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>{renderSecurityBody()}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sign in with an emailed code</CardTitle>
          <CardDescription>
            Lets you sign in with a one-time code sent to your address instead of
            your password. Because the code proves you control the inbox, it also
            stands in for your authenticator app.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <label
              className="text-foreground text-sm font-medium"
              htmlFor="admin-security-email-code"
            >
              Allow emailed sign-in codes
            </label>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Codes go to {email ?? 'your account address'} and expire quickly.
            </p>
          </div>
          <Switch
            aria-label="Allow emailed sign-in codes"
            checked={status?.isEmailCodeLoginEnabled ?? false}
            disabled={status === null || isPreferenceSaving}
            id="admin-security-email-code"
            onCheckedChange={(next) => {
              dispatch(
                adminEmailCodeLoginPreferenceRequested({
                  isEmailCodeLoginEnabled: next,
                }),
              );
            }}
          />
        </CardContent>
      </Card>

      <AdminUserMfaResetCard />
    </div>
  );
}
