import { Loader2, Search, ShieldOff, UserSearch } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RESET_PLATFORM_USER_MFA, SEARCH_PLATFORM_USERS } from '@/lib/api/Api';
import { getApiErrorMessage } from '@/lib/api/errorMessage';
import type { PlatformUserSearchItem } from '@/lib/api/types';

/** Matches the server-side minimum length for the lookup query. */
const MIN_SEARCH_LENGTH = 3;

/**
 * Last-resort recovery for a user who lost both their authenticator app and
 * their recovery codes. Resetting clears their second factor and signs them out
 * everywhere, so it is deliberately explicit and confirmed.
 */
export function AdminUserMfaResetCard(): ReactElement {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<PlatformUserSearchItem[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingReset, setPendingReset] =
    useState<PlatformUserSearchItem | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const canSearch = search.trim().length >= MIN_SEARCH_LENGTH;

  const runSearch = async (): Promise<void> => {
    if (!canSearch) {
      return;
    }
    setIsSearching(true);
    setError(null);
    try {
      const response = await SEARCH_PLATFORM_USERS({ search: search.trim() });
      setResults(response.data.data.items);
    } catch (caught: unknown) {
      setResults(null);
      setError(getApiErrorMessage(caught, 'Unable to search accounts'));
    } finally {
      setIsSearching(false);
    }
  };

  const confirmReset = async (): Promise<void> => {
    if (pendingReset === null) {
      return;
    }
    setIsResetting(true);
    try {
      const response = await RESET_PLATFORM_USER_MFA(pendingReset.id);
      toast.success(response.data.message);
      setPendingReset(null);
      // The row's badge is now stale; re-run the same lookup to show the change.
      await runSearch();
    } catch (caught: unknown) {
      toast.error(getApiErrorMessage(caught, 'Unable to reset two-factor'));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Locked-out accounts</CardTitle>
        <CardDescription>
          Find a user who cannot pass their second factor and clear it. They keep
          their password, lose every session, and are emailed about the change.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="flex flex-wrap items-center gap-2"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void runSearch();
          }}
        >
          <div className="min-w-[220px] flex-1">
            <Input
              aria-label="Search accounts by email or name"
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              placeholder="Email or name (at least 3 characters)"
              type="search"
              value={search}
            />
          </div>
          <Button disabled={!canSearch || isSearching} size="lg" type="submit">
            {isSearching ? (
              <Loader2 aria-hidden className="animate-spin" />
            ) : (
              <Search aria-hidden />
            )}
            Search
          </Button>
        </form>

        {error !== null ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}

        {results !== null && results.length === 0 ? (
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <UserSearch aria-hidden className="size-4" />
            No accounts matched that search.
          </p>
        ) : null}

        {results !== null && results.length > 0 ? (
          <ul className="divide-border border-border divide-y rounded-lg border">
            {results.map((user) => (
              <li
                className="flex flex-wrap items-center justify-between gap-3 p-3"
                key={user.id}
              >
                <div className="min-w-0">
                  <p className="text-foreground truncate text-sm font-medium">
                    {user.email}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {user.displayName ?? 'No display name'}
                    {' · '}
                    {user.isPlatformAdmin
                      ? 'Platform operator'
                      : (user.organizationName ?? 'No organization')}
                    {user.isActive ? '' : ' · Inactive'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.isTotpEnabled ? 'default' : 'muted'}>
                    {user.isTotpEnabled ? '2FA on' : '2FA off'}
                  </Badge>
                  <Button
                    disabled={!user.isTotpEnabled}
                    onClick={() => {
                      setPendingReset(user);
                    }}
                    size="sm"
                    type="button"
                    variant="destructive"
                  >
                    <ShieldOff aria-hidden />
                    Reset 2FA
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            setPendingReset(null);
          }
        }}
        open={pendingReset !== null}
      >
        <AlertDialogContent size="default">
          <AlertDialogHeader className="sm:text-left">
            <AlertDialogTitle className="flex items-center gap-2.5">
              <span className="bg-destructive/12 text-destructive border-destructive/25 flex size-9 shrink-0 items-center justify-center rounded-lg border">
                <ShieldOff aria-hidden className="size-4" />
              </span>
              Reset two-factor for {pendingReset?.email}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Their authenticator app and recovery codes stop working, and every
              session is signed out. Until they enroll again, their password is
              the only thing protecting the account — confirm who you are talking
              to before doing this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
            <AlertDialogCancel disabled={isResetting} type="button">
              Cancel
            </AlertDialogCancel>
            <Button
              disabled={isResetting}
              onClick={() => {
                void confirmReset();
              }}
              type="button"
              variant="destructive"
            >
              {isResetting ? (
                <Loader2 aria-hidden className="size-4 animate-spin" />
              ) : (
                <ShieldOff aria-hidden className="size-4" />
              )}
              Reset two-factor
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
