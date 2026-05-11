import {
  Activity,
  Ban,
  Building2,
  Calendar,
  CalendarClock,
  CalendarRange,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CreditCard,
  Hash,
  History,
  Info,
  Layers,
  Link2,
  PauseCircle,
  Pencil,
  Search,
  Tag,
  Trash2,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useState, type ReactElement, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { PlatformTenantDeleteConfirmDialog } from '@/pages/admin/components/PlatformTenantDeleteConfirmDialog';
import { PlatformTenantListSkeleton } from '@/pages/admin/components/PlatformTenantListSkeleton';
import {
  platformTenantDeleteFlowRequested,
  platformTenantsListSyncFlowRequested,
  platformTenantUpdateFlowRequested,
} from '@/features/platform/saga/platformSaga';
import {
  platformTenantMutationErrorCleared,
  type PlatformTenantActiveFilter,
  type PlatformTenantsListParams,
} from '@/features/platform/slice/platformTenantsSlice';
import type { TenantProfile, UpdateTenantPayload } from '@/lib/api/types';
import { usePlatformTenantDetail } from '@/lib/platform/usePlatformTenantDetail';
import { buildPaginationItems } from '@/lib/pagination/buildPaginationItems';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const TENANT_SEARCH_DEBOUNCE_MS = 400;

function formatDate(iso: string | null | undefined): string {
  if (iso === null || iso === undefined || iso.length === 0) {
    return '—';
  }
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatJoinedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function TenantDetailField(props: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}): ReactElement {
  const Icon = props.icon;
  return (
    <div className="border-border/55 bg-muted/25 flex gap-3 rounded-xl border p-3 shadow-sm">
      <span className="bg-background text-primary flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 shadow-xs">
        <Icon aria-hidden className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-[0.65rem] font-semibold uppercase tracking-wider">
          {props.label}
        </p>
        <div className="text-foreground mt-1 text-sm leading-snug">{props.children}</div>
      </div>
    </div>
  );
}

function subscriptionStatusTone(status: string): string {
  const s = status.trim().toLowerCase();
  if (s === 'active' || s === 'trialing') {
    return 'bg-emerald-500/12 text-emerald-800 dark:text-emerald-300';
  }
  if (s === 'past_due' || s === 'unpaid') {
    return 'bg-amber-500/12 text-amber-900 dark:text-amber-200';
  }
  if (s === 'canceled' || s === 'inactive') {
    return 'bg-muted text-muted-foreground';
  }
  return 'bg-sky-500/10 text-sky-900 dark:text-sky-200';
}

function TenantListBillingPill(props: {
  subscription: TenantProfile['subscription'];
}): ReactElement | null {
  const sub = props.subscription;
  if (sub === undefined) {
    return null;
  }
  if (sub === null) {
    return (
      <span className="text-muted-foreground inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-0.5 text-xs font-medium">
        <CreditCard aria-hidden className="size-3.5 shrink-0" />
        No billing
      </span>
    );
  }

  const normalized = sub.status.trim().toLowerCase();
  const isPaying = normalized === 'active' || normalized === 'trialing';
  const label = isPaying ? 'Subscribed' : sub.status;

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${subscriptionStatusTone(sub.status)}`}
    >
      <CreditCard aria-hidden className="size-3.5 shrink-0" />
      <span className="truncate capitalize">{label}</span>
    </span>
  );
}

export function AdminTenantsPage() {
  const dispatch = useAppDispatch();

  const {
    items,
    total,
    page,
    limit,
    isLoading,
    error,
    isMutationPending,
    mutationError,
    params,
  } = useAppSelector((s) => s.platformTenants);

  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));

  const sync = useCallback(
    (overrides?: Partial<PlatformTenantsListParams>) => {
      dispatch(platformTenantsListSyncFlowRequested(overrides ?? {}));
    },
    [dispatch],
  );

  const updateTenant = useCallback(
    (tenantId: string, payload: UpdateTenantPayload) => {
      dispatch(platformTenantUpdateFlowRequested({ tenantId, payload }));
    },
    [dispatch],
  );

  const deleteTenant = useCallback(
    (tenantId: string) => {
      dispatch(platformTenantDeleteFlowRequested({ tenantId }));
    },
    [dispatch],
  );

  const clearMutationError = useCallback(() => {
    dispatch(platformTenantMutationErrorCleared());
  }, [dispatch]);

  const {
    isDetailSessionOpen,
    detail: tenantDetail,
    isLoading: isDetailLoading,
    error: detailError,
    subscription: tenantSubscription,
    isSubscriptionLoading,
    subscriptionError,
    openDetail,
    closeDetail,
    reload: reloadTenantDetail,
  } = usePlatformTenantDetail();

  const [searchDraft, setSearchDraft] = useState(params.search);
  const [includeDeletedDraft, setIncludeDeletedDraft] = useState(params.includeDeleted);
  const [activeFilterDraft, setActiveFilterDraft] =
    useState<PlatformTenantActiveFilter>(params.activeFilter);

  const debouncedSearch = useDebouncedValue(searchDraft, TENANT_SEARCH_DEBOUNCE_MS);

  const [editTarget, setEditTarget] = useState<TenantProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<TenantProfile | null>(null);

  const effectiveTotalPages = Math.max(totalPages, 1);
  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);
  const paginationItems = buildPaginationItems(page, effectiveTotalPages);
  const showPaginationFooter = error === null && (total > 0 || items.length > 0);

  const goToPage = (nextPage: number): void => {
    if (nextPage < 1 || nextPage > effectiveTotalPages || isLoading) {
      return;
    }
    sync({ page: nextPage });
  };

  const handleClearSearch = (): void => {
    setSearchDraft('');
    sync({
      search: '',
      includeDeleted: includeDeletedDraft,
      activeFilter: activeFilterDraft,
      page: 1,
    });
  };

  useEffect(() => {
    sync({
      search: debouncedSearch,
      includeDeleted: includeDeletedDraft,
      activeFilter: activeFilterDraft,
      page: 1,
    });
  }, [debouncedSearch, includeDeletedDraft, activeFilterDraft, sync]);

  useEffect(() => {
    if (editTarget === null) {
      return;
    }
    setEditName(editTarget.name);
    setEditIsActive(editTarget.isActive);
  }, [editTarget]);

  const openEdit = (row: TenantProfile): void => {
    if (row.deletedAt !== null) {
      return;
    }
    clearMutationError();
    setEditTarget(row);
  };

  const openDelete = (row: TenantProfile): void => {
    if (row.deletedAt !== null) {
      return;
    }
    clearMutationError();
    setDeleteTarget(row);
  };

  const handleSaveEdit = (): void => {
    if (editTarget === null) {
      return;
    }
    const trimmed = editName.trim();
    if (trimmed.length === 0) {
      return;
    }
    updateTenant(editTarget.id, {
      name: trimmed,
      isActive: editIsActive,
    });
    setEditTarget(null);
  };

  const handleConfirmDelete = (): void => {
    if (deleteTarget === null) {
      return;
    }
    deleteTenant(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl space-y-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">Organizations</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Cross-tenant directory — search is debounced; filters apply immediately. Platform admin
          only.
        </p>
      </div>

      <section className="border-border/70 rounded-2xl border bg-card/95 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="relative min-w-0 flex-1 sm:max-w-md">
              <label
                className="text-foreground mb-1.5 block text-xs font-medium"
                htmlFor="platform-tenant-search"
              >
                Search by name or id
              </label>
              <div className="relative">
                <Search
                  className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
                  aria-hidden
                />
                <input
                  className="border-border/70 bg-muted/25 text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/40 h-10 w-full rounded-lg border pl-9 pr-3 text-sm outline-none focus-visible:ring-2"
                  id="platform-tenant-search"
                  autoComplete="off"
                  maxLength={200}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  placeholder="Type to filter…"
                  type="search"
                  value={searchDraft}
                />
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                disabled={searchDraft.length === 0 && params.search.length === 0}
                onClick={handleClearSearch}
                type="button"
                variant="outline"
              >
                Clear
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="tenant-status-filter">Status</Label>
              <Select
                value={activeFilterDraft}
                onValueChange={(v) => setActiveFilterDraft(v as PlatformTenantActiveFilter)}
              >
                <SelectTrigger id="tenant-status-filter" className="w-[10.5rem]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active only</SelectItem>
                  <SelectItem value="inactive">Inactive only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pb-0.5">
              <Switch
                id="include-deleted"
                checked={includeDeletedDraft}
                onCheckedChange={setIncludeDeletedDraft}
              />
              <Label htmlFor="include-deleted" className="cursor-pointer font-normal">
                Include soft-deleted
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-page-size">Rows / page</Label>
              <Select
                value={String(limit)}
                onValueChange={(v) => {
                  sync({ limit: Number(v), page: 1 });
                }}
              >
                <SelectTrigger id="tenant-page-size" className="w-[5.5rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {[10, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {mutationError !== null ? (
            <p className="text-destructive text-sm" role="alert">
              {mutationError}
            </p>
          ) : null}
        </div>
      </section>

      {error !== null ? (
        <section className="border-destructive/40 bg-destructive/10 rounded-xl border px-4 py-3 text-sm shadow-sm">
          <p className="text-destructive font-medium">{error}</p>
          <Button
            className="mt-3"
            onClick={() => {
              sync({
                search: debouncedSearch,
                includeDeleted: includeDeletedDraft,
                activeFilter: activeFilterDraft,
                page,
              });
            }}
            size="sm"
            type="button"
            variant="outline"
          >
            Retry
          </Button>
        </section>
      ) : null}

      <section className="border-border/70 overflow-hidden rounded-2xl border bg-card/95 shadow-sm">
        <div className="border-border/60 flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 sm:px-5">
          <p className="text-muted-foreground inline-flex items-center gap-2 text-xs sm:text-sm">
            <Building2 aria-hidden className="text-muted-foreground/80 size-4 shrink-0" />
            {isLoading && items.length === 0 ? (
              <Skeleton aria-hidden className="inline-block h-4 w-[min(18rem,100%)] max-w-full" />
            ) : isLoading ? (
              <span className="text-muted-foreground/90">Refreshing list…</span>
            ) : (
              <span>
                {total === 0
                  ? 'No organizations match your filters.'
                  : `Showing ${startIndex}–${endIndex} of ${total}`}
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <Button
              aria-label="Previous page"
              disabled={page <= 1 || isLoading || effectiveTotalPages <= 1}
              onClick={() => goToPage(page - 1)}
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-muted-foreground min-w-[5.5rem] text-center text-xs tabular-nums sm:text-sm">
              Page {page} of {effectiveTotalPages}
            </span>
            <Button
              aria-label="Next page"
              disabled={page >= effectiveTotalPages || isLoading || effectiveTotalPages <= 1}
              onClick={() => goToPage(page + 1)}
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="divide-border/60 divide-y">
          {isLoading && items.length === 0 ? <PlatformTenantListSkeleton /> : null}
          {!isLoading && items.length === 0 && error === null ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 px-4 py-10 text-center text-sm sm:px-5">
              <Building2 aria-hidden className="text-muted-foreground/50 size-8" />
              <span>No organizations to display.</span>
            </div>
          ) : null}
          {!isLoading
            ? items.map((row) => {
                const isPurged = row.deletedAt !== null;
                return (
                  <div
                    key={row.id}
                    className={
                      isPurged
                        ? 'hover:bg-muted/30 border-amber-500/35 bg-amber-500/[0.04] flex flex-col gap-1 border-l-2 px-4 py-3 pl-[calc(1rem-2px)] transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:pl-[calc(1.25rem-2px)]'
                        : 'hover:bg-muted/30 flex flex-col gap-1 px-4 py-3 transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-5'
                    }
                  >
                    <div className="flex min-w-0 flex-1 gap-3 sm:items-start">
                      <Building2
                        aria-hidden
                        className="text-muted-foreground/80 mt-0.5 size-4 shrink-0 sm:size-[1.125rem]"
                      />
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <p className="text-foreground truncate text-sm font-medium">{row.name}</p>
                          {isPurged ? (
                            <span
                              className="bg-amber-500/15 text-amber-800 dark:text-amber-200 inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide"
                              title="Scheduled for TTL purge"
                            >
                              Purge pending
                            </span>
                          ) : null}
                          <TenantListBillingPill subscription={row.subscription} />
                        </div>
                        <p className="text-muted-foreground mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                          <span className="inline-flex min-w-0 max-w-full items-center gap-1 font-mono">
                            <Hash aria-hidden className="size-3 shrink-0 opacity-70" />
                            <span className="truncate">{row.id}</span>
                          </span>
                          <span className="text-muted-foreground/80 inline-flex items-center gap-1">
                            <Calendar aria-hidden className="size-3 shrink-0 opacity-70" />
                            <span>Created {formatJoinedDate(row.createdAt)}</span>
                          </span>
                          {isPurged && row.purgeAt !== null ? (
                          <span className="text-muted-foreground/80 inline-flex items-center gap-1">
                            <CalendarClock aria-hidden className="size-3 shrink-0 opacity-70" />
                            <span>Purge {formatDate(row.purgeAt)}</span>
                          </span>
                          ) : null}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                      {!isPurged ? (
                        <>
                          <span
                            className={
                              row.isActive
                                ? 'inline-flex items-center gap-1 rounded-md bg-emerald-500/12 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400'
                                : 'inline-flex items-center gap-1 rounded-md bg-amber-500/12 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300'
                            }
                          >
                            {row.isActive ? (
                              <CheckCircle2 aria-hidden className="size-3.5 shrink-0" />
                            ) : (
                              <PauseCircle aria-hidden className="size-3.5 shrink-0" />
                            )}
                            {row.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/12 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
                          <CalendarClock aria-hidden className="size-3.5 shrink-0" />
                          Scheduled removal
                        </span>
                      )}
                      <Button
                        disabled={isMutationPending}
                        onClick={() => openDetail(row.id)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Info aria-hidden className="mr-1 size-3.5" />
                        Details
                      </Button>
                      <Button
                        disabled={isPurged || isMutationPending}
                        onClick={() => openEdit(row)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Pencil aria-hidden className="mr-1 size-3.5" />
                        Edit
                      </Button>
                      <Button
                        className="text-destructive hover:text-destructive"
                        disabled={isPurged || isMutationPending}
                        onClick={() => openDelete(row)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Trash2 aria-hidden className="mr-1 size-3.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })
            : null}
        </div>

        {showPaginationFooter ? (
          <div className="border-border/60 bg-muted/5 border-t px-3 py-3 sm:px-5">
            <Pagination>
              <PaginationContent className="justify-center">
                <PaginationItem>
                  <PaginationPrevious
                    disabled={page <= 1 || isLoading || effectiveTotalPages <= 1}
                    onClick={() => goToPage(page - 1)}
                  />
                </PaginationItem>
                {paginationItems.map((item, itemIndex) =>
                  item === 'ellipsis' ? (
                    <PaginationItem key={`ellipsis-${itemIndex}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink
                        aria-label={`Page ${item}`}
                        disabled={isLoading}
                        isActive={item === page}
                        onClick={() => goToPage(item)}
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationNext
                    disabled={
                      page >= effectiveTotalPages || isLoading || effectiveTotalPages <= 1
                    }
                    onClick={() => goToPage(page + 1)}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        ) : null}
      </section>

      <Sheet
        open={isDetailSessionOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDetail();
          }
        }}
      >
        <SheetContent side="right" className="flex flex-1 flex-col gap-0 overflow-y-auto">
          <SheetHeader className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <span className="bg-primary/12 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 shadow-sm">
                <Building2 aria-hidden className="size-5" />
              </span>
              <div className="min-w-0 pt-0.5">
                <SheetTitle className="text-lg leading-tight">Organization details</SheetTitle>
                <SheetDescription className="mt-1.5">
                  Platform directory record and Mongo billing snapshot (Stripe ids are
                  webhook-synced).
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-5 px-4 pb-4 pt-2 sm:px-6">
            {detailError !== null ? (
              <div
                className="border-destructive/35 bg-destructive/8 text-destructive flex gap-3 rounded-xl border p-3 text-sm"
                role="alert"
              >
                <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p className="leading-snug">{detailError}</p>
                  <Button
                    disabled={isDetailLoading}
                    onClick={() => {
                      reloadTenantDetail();
                    }}
                    size="sm"
                    type="button"
                    variant="outline"
                    className="border-destructive/40 self-start"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            ) : null}

            {detailError === null && isDetailLoading ? (
              <div className="space-y-3 py-2">
                <Skeleton className="h-16 w-full max-w-full rounded-xl" />
                <Skeleton className="h-16 w-full max-w-full rounded-xl" />
                <Skeleton className="h-16 w-[92%] max-w-full rounded-xl" />
              </div>
            ) : null}

            {detailError === null && !isDetailLoading && tenantDetail !== null ? (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2.5">
                  <p className="text-muted-foreground flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
                    <Building2 aria-hidden className="size-3.5" />
                    Organization
                  </p>
                  <TenantDetailField icon={Building2} label="Name">
                    <span className="font-medium">{tenantDetail.name}</span>
                  </TenantDetailField>
                  <TenantDetailField icon={Hash} label="Organization id">
                    <span className="font-mono text-xs tracking-tight break-all">
                      {tenantDetail.id}
                    </span>
                  </TenantDetailField>
                  <TenantDetailField icon={Activity} label="Status">
                    {tenantDetail.deletedAt !== null ? (
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-amber-500/12 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-200">
                        <CalendarClock aria-hidden className="size-3.5 shrink-0" />
                        Scheduled for purge
                      </span>
                    ) : tenantDetail.isActive ? (
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-emerald-500/12 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 aria-hidden className="size-3.5 shrink-0" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-amber-500/12 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-200">
                        <PauseCircle aria-hidden className="size-3.5 shrink-0" />
                        Inactive
                      </span>
                    )}
                  </TenantDetailField>
                  <TenantDetailField icon={Calendar} label="Created">
                    {formatDate(tenantDetail.createdAt)}
                  </TenantDetailField>
                  <TenantDetailField icon={CalendarRange} label="Updated">
                    {formatDate(tenantDetail.updatedAt)}
                  </TenantDetailField>
                  {tenantDetail.deletedAt !== null ? (
                    <TenantDetailField icon={CalendarClock} label="Deleted at">
                      {formatDate(tenantDetail.deletedAt)}
                    </TenantDetailField>
                  ) : null}
                  {tenantDetail.purgeAt !== null ? (
                    <TenantDetailField icon={CalendarClock} label="Purge at">
                      {formatDate(tenantDetail.purgeAt)}
                    </TenantDetailField>
                  ) : null}
                </div>

                <Separator className="bg-border/70" />

                <div className="flex flex-col gap-2.5">
                  <p className="text-muted-foreground flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
                    <CreditCard aria-hidden className="size-3.5" />
                    Billing & subscription
                  </p>

                  {isSubscriptionLoading && tenantSubscription === null ? (
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-full max-w-full rounded-xl" />
                      <Skeleton className="h-16 w-full max-w-full rounded-xl" />
                    </div>
                  ) : null}

                  {subscriptionError !== null ? (
                    <div
                      className="border-destructive/35 bg-destructive/8 text-destructive flex gap-3 rounded-xl border p-3 text-sm"
                      role="alert"
                    >
                      <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <p className="leading-snug">{subscriptionError}</p>
                        <Button
                          disabled={isSubscriptionLoading}
                          onClick={() => {
                            reloadTenantDetail();
                          }}
                          size="sm"
                          type="button"
                          variant="outline"
                          className="border-destructive/40 self-start"
                        >
                          Retry
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {subscriptionError === null && tenantSubscription !== null ? (
                    <div className="flex flex-col gap-2.5">
                      <TenantDetailField icon={Activity} label="Subscription status">
                        <span
                          className={`inline-flex w-fit items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${subscriptionStatusTone(tenantSubscription.status)}`}
                        >
                          {tenantSubscription.status}
                        </span>
                      </TenantDetailField>
                      <TenantDetailField icon={Layers} label="Plan key">
                        {tenantSubscription.planKey.length > 0 ? tenantSubscription.planKey : '—'}
                      </TenantDetailField>

                      <Separator className="my-1 bg-border/70" />

                      <p className="text-muted-foreground flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
                        <Link2 aria-hidden className="size-3.5" />
                        Stripe identifiers
                      </p>
                      <TenantDetailField icon={UserRound} label="Customer">
                        <span className="font-mono text-xs break-all">
                          {tenantSubscription.stripeCustomerId ?? '—'}
                        </span>
                      </TenantDetailField>
                      <TenantDetailField icon={Link2} label="Subscription">
                        <span className="font-mono text-xs break-all">
                          {tenantSubscription.stripeSubscriptionId ?? '—'}
                        </span>
                      </TenantDetailField>
                      <TenantDetailField icon={Tag} label="Price">
                        <span className="font-mono text-xs break-all">
                          {tenantSubscription.stripePriceId ?? '—'}
                        </span>
                      </TenantDetailField>

                      <Separator className="my-1 bg-border/70" />

                      <p className="text-muted-foreground flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
                        <CalendarRange aria-hidden className="size-3.5" />
                        Billing period
                      </p>
                      <TenantDetailField icon={CalendarRange} label="Current period">
                        <span className="text-xs sm:text-sm">
                          {formatDate(tenantSubscription.currentPeriodStart)} →{' '}
                          {formatDate(tenantSubscription.currentPeriodEnd)}
                        </span>
                      </TenantDetailField>
                      <TenantDetailField icon={Ban} label="Cancel at period end">
                        {tenantSubscription.cancelAtPeriodEnd ? 'Yes' : 'No'}
                      </TenantDetailField>

                      <Separator className="my-1 bg-border/70" />

                      <TenantDetailField icon={History} label="Billing row timestamps">
                        <span className="text-xs">
                          <span className="block">
                            Created {formatDate(tenantSubscription.createdAt)}
                          </span>
                          <span className="mt-1 block">
                            Updated {formatDate(tenantSubscription.updatedAt)}
                          </span>
                        </span>
                      </TenantDetailField>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <Separator />
          <SheetFooter className="flex-row justify-end gap-2 px-4 pb-4 sm:space-x-0 sm:px-6">
            <Button type="button" variant="outline" onClick={() => closeDetail()}>
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet
        open={editTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditTarget(null);
          }
        }}
      >
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Edit organization</SheetTitle>
            <SheetDescription>
              PATCH /platform/tenants/:tenantId — cannot update organizations already scheduled for
              purge.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoComplete="organization"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="edit-active"
                checked={editIsActive}
                onCheckedChange={setEditIsActive}
              />
              <Label htmlFor="edit-active" className="cursor-pointer font-normal">
                Organization active
              </Label>
            </div>
          </div>
          <Separator />
          <SheetFooter className="flex-row justify-end gap-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditTarget(null)}
              disabled={isMutationPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveEdit}
              disabled={isMutationPending || editName.trim().length === 0}
            >
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <PlatformTenantDeleteConfirmDialog
        isRemoving={isMutationPending}
        onConfirmRemove={handleConfirmDelete}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        open={deleteTarget !== null}
        organizationName={deleteTarget?.name ?? null}
      />
    </div>
  );
}
