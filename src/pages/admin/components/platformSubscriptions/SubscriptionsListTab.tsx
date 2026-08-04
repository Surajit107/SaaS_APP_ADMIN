import {
  Activity,
  ArrowDownAZ,
  ArrowUpAZ,
  Ban,
  Building2,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CreditCard,
  History,
  Info,
  Layers,
  Link2,
  Search,
  SlidersHorizontal,
  Tag,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useState, type ReactElement, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { PlatformTenantListSkeleton } from '@/pages/admin/components/PlatformTenantListSkeleton';
import {
  GET_PLATFORM_SUBSCRIPTION_BY_TENANT,
  GET_PLATFORM_SUBSCRIPTIONS,
} from '@/lib/api/Api';
import { getApiErrorMessage } from '@/lib/api/errorMessage';
import type { PlatformSubscriptionListQuery, PlatformSubscriptionRow } from '@/lib/api/types';
import { buildPaginationItems } from '@/lib/pagination/buildPaginationItems';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const SEARCH_DEBOUNCE_MS = 400;
const PLATFORM_SUB_LIST_MAX_LIMIT = 100;
const PLATFORM_SUB_LIST_DEFAULT_LIMIT = 20;

const STATUS_FILTER_VALUES = [
  'all',
  'active',
  'trialing',
  'past_due',
  'canceled',
  'unpaid',
  'incomplete',
  'paused',
  'inactive',
] as const;

type StatusFilterValue = (typeof STATUS_FILTER_VALUES)[number];

const SORT_BY_VALUES = [
  'updatedAt',
  'createdAt',
  'status',
  'planKey',
  'tenantName',
] as const;

type SortByValue = (typeof SORT_BY_VALUES)[number];

const SORT_ORDER_VALUES = ['desc', 'asc'] as const;

type SortOrderValue = (typeof SORT_ORDER_VALUES)[number];

const SORT_BY_LABELS: Record<SortByValue, string> = {
  updatedAt: 'Updated',
  createdAt: 'Created',
  status: 'Status',
  planKey: 'Plan key',
  tenantName: 'Organization',
};

function resolveListLimit(requested: number | undefined): number {
  if (requested === undefined) {
    return PLATFORM_SUB_LIST_DEFAULT_LIMIT;
  }
  const n = Math.floor(requested);
  if (!Number.isFinite(n)) {
    return PLATFORM_SUB_LIST_DEFAULT_LIMIT;
  }
  return Math.min(PLATFORM_SUB_LIST_MAX_LIMIT, Math.max(1, n));
}

function formatDateTime(iso: string | null | undefined): string {
  if (iso === null || iso === undefined || iso.length === 0) {
    return '—';
  }
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function resolveTenantDisplayName(row: PlatformSubscriptionRow): string {
  if (row.tenantName !== null && row.tenantName.trim().length > 0) {
    return row.tenantName.trim();
  }
  return 'Unknown organization';
}

function DetailField(props: { icon: LucideIcon; label: string; children: ReactNode }): ReactElement {
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

export function SubscriptionsListTab(): ReactElement {
  const [items, setItems] = useState<PlatformSubscriptionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PLATFORM_SUB_LIST_DEFAULT_LIMIT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [searchDraft, setSearchDraft] = useState('');
  const debouncedSearch = useDebouncedValue(searchDraft, SEARCH_DEBOUNCE_MS);
  const [sortBy, setSortBy] = useState<SortByValue>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrderValue>('desc');

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTenantId, setDetailTenantId] = useState<string | null>(null);
  const [detailRow, setDetailRow] = useState<PlatformSubscriptionRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));
  const effectiveTotalPages = Math.max(totalPages, 1);
  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);
  const paginationItems = buildPaginationItems(page, effectiveTotalPages);
  const showPaginationFooter = error === null && (total > 0 || items.length > 0);

  const loadList = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    const trimmedSearch = debouncedSearch.trim();
    const query: PlatformSubscriptionListQuery = {
      page,
      limit: resolveListLimit(limit),
      sortBy,
      sortOrder,
    };
    if (statusFilter !== 'all') {
      query.status = statusFilter;
    }
    if (trimmedSearch.length > 0) {
      query.search = trimmedSearch;
    }
    try {
      const res = await GET_PLATFORM_SUBSCRIPTIONS(query);
      const data = res.data.data;
      setItems(data.items);
      setTotal(data.total);
      setPage(data.page);
      setLimit(data.limit);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Unable to load subscriptions'));
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, statusFilter, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const goToPage = (nextPage: number): void => {
    if (nextPage < 1 || nextPage > effectiveTotalPages || isLoading) {
      return;
    }
    setPage(nextPage);
  };

  const openDetail = (row: PlatformSubscriptionRow): void => {
    setDetailTenantId(row.tenantId);
    setDetailRow(row);
    setDetailError(null);
    setDetailOpen(true);
  };

  useEffect(() => {
    if (!detailOpen || detailTenantId === null) {
      return undefined;
    }
    let cancelled = false;
    setDetailLoading(true);
    setDetailError(null);
    void (async () => {
      try {
        const res = await GET_PLATFORM_SUBSCRIPTION_BY_TENANT(detailTenantId);
        if (!cancelled) {
          setDetailRow(res.data.data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setDetailError(getApiErrorMessage(err, 'Unable to load subscription'));
        }
      } finally {
        if (!cancelled) {
          setDetailLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [detailOpen, detailTenantId]);

  const handleClearSearch = (): void => {
    setSearchDraft('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <section className="border-border/70 rounded-2xl border bg-card/95 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="relative min-w-0 flex-1 sm:max-w-md">
              <label
                className="text-foreground mb-1.5 flex items-center gap-1.5 text-xs font-medium"
                htmlFor="platform-sub-search"
              >
                <Building2 aria-hidden className="text-muted-foreground size-3.5" />
                Search by organization name or id
              </label>
              <div className="relative">
                <Search
                  className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
                  aria-hidden
                />
                <input
                  className="border-border/70 bg-muted/25 text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/40 h-10 w-full rounded-lg border pl-9 pr-3 text-sm outline-none focus-visible:ring-2"
                  id="platform-sub-search"
                  autoComplete="off"
                  maxLength={200}
                  onChange={(e) => {
                    setSearchDraft(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Type to filter…"
                  spellCheck={false}
                  type="search"
                  value={searchDraft}
                />
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                disabled={searchDraft.length === 0}
                onClick={handleClearSearch}
                type="button"
                variant="outline"
              >
                Clear search
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
            <div className="space-y-2">
              <Label className="inline-flex items-center gap-1.5" htmlFor="sub-status-filter">
                <SlidersHorizontal aria-hidden className="text-muted-foreground size-3.5" />
                Subscription status
              </Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v as StatusFilterValue);
                  setPage(1);
                }}
              >
                <SelectTrigger id="sub-status-filter" className="w-[11rem]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {STATUS_FILTER_VALUES.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v === 'all' ? 'All statuses' : v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="inline-flex items-center gap-1.5" htmlFor="sub-sort-by">
                <ArrowDownAZ aria-hidden className="text-muted-foreground size-3.5" />
                Sort by
              </Label>
              <Select
                value={sortBy}
                onValueChange={(v) => {
                  setSortBy(v as SortByValue);
                  setPage(1);
                }}
              >
                <SelectTrigger id="sub-sort-by" className="w-[11rem]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {SORT_BY_VALUES.map((v) => (
                    <SelectItem key={v} value={v}>
                      {SORT_BY_LABELS[v]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="inline-flex items-center gap-1.5" htmlFor="sub-sort-order">
                <ArrowUpAZ aria-hidden className="text-muted-foreground size-3.5" />
                Order
              </Label>
              <Select
                value={sortOrder}
                onValueChange={(v) => {
                  setSortOrder(v as SortOrderValue);
                  setPage(1);
                }}
              >
                <SelectTrigger id="sub-sort-order" className="w-[9rem]">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="desc">Newest / Z→A</SelectItem>
                  <SelectItem value="asc">Oldest / A→Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="inline-flex items-center gap-1.5" htmlFor="sub-page-size">
                <Layers aria-hidden className="text-muted-foreground size-3.5" />
                Rows / page
              </Label>
              <Select
                value={String(limit)}
                onValueChange={(v) => {
                  setLimit(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger id="sub-page-size" className="w-[5.5rem]">
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
        </div>
      </section>

      {error !== null ? (
        <section className="border-destructive/40 bg-destructive/10 rounded-xl border px-4 py-3 text-sm shadow-sm">
          <p className="text-destructive font-medium">{error}</p>
          <Button
            className="mt-3"
            onClick={() => {
              void loadList();
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
          <div className="text-muted-foreground inline-flex items-center gap-2 text-xs sm:text-sm">
            <CreditCard aria-hidden className="text-muted-foreground/80 size-4 shrink-0" />
            {isLoading && items.length === 0 ? (
              <Skeleton aria-hidden className="inline-block h-4 w-[min(18rem,100%)] max-w-full" />
            ) : isLoading ? (
              <span className="text-muted-foreground/90">Refreshing list…</span>
            ) : (
              <span>
                {total === 0
                  ? 'No subscription rows match your filters.'
                  : `Showing ${startIndex}–${endIndex} of ${total}`}
              </span>
            )}
          </div>
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
              <CreditCard aria-hidden className="text-muted-foreground/50 size-8" />
              <span>No billing rows to display (orgs without checkout have no row).</span>
            </div>
          ) : null}
          {!isLoading
            ? items.map((row) => (
                <div
                  key={row.tenantId}
                  className="hover:bg-muted/30 flex flex-col gap-1 px-4 py-3 transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="flex min-w-0 flex-1 gap-3 sm:items-start">
                    <Building2
                      aria-hidden
                      className="text-muted-foreground/80 mt-0.5 size-4 shrink-0 sm:size-[1.125rem]"
                    />
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <p className="text-foreground truncate text-sm font-medium">
                          {resolveTenantDisplayName(row)}
                        </p>
                        <span
                          className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${subscriptionStatusTone(row.status)}`}
                        >
                          {row.status}
                        </span>
                        {row.tenantIsActive === false ? (
                          <span className="bg-muted text-muted-foreground inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide">
                            Org inactive
                          </span>
                        ) : null}
                      </div>
                      <p className="text-muted-foreground mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <span className="inline-flex min-w-0 items-center gap-1 truncate font-mono">
                          <span className="truncate">{row.tenantId}</span>
                        </span>
                        <span className="inline-flex min-w-0 items-center gap-1 truncate">
                          <Tag aria-hidden className="text-muted-foreground/80 size-3 shrink-0" />
                          <span className="truncate">
                            Plan key:{' '}
                            <span className="text-foreground font-medium">
                              {row.planKey.length > 0 ? row.planKey : '—'}
                            </span>
                          </span>
                        </span>
                        {row.cancelAtPeriodEnd ? (
                          <span className="text-amber-800 dark:text-amber-200 inline-flex items-center gap-1">
                            <Ban aria-hidden className="size-3 shrink-0" />
                            Cancel at period end
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    <Button
                      onClick={() => openDetail(row)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Info aria-hidden className="mr-1 size-3.5" />
                      Details
                    </Button>
                  </div>
                </div>
              ))
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
                    disabled={page >= effectiveTotalPages || isLoading || effectiveTotalPages <= 1}
                    onClick={() => goToPage(page + 1)}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        ) : null}
      </section>

      <Sheet
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setDetailTenantId(null);
            setDetailRow(null);
            setDetailError(null);
          }
        }}
      >
        <SheetContent className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto">
          <SheetHeader className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <span className="bg-primary/12 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 shadow-sm">
                <CreditCard aria-hidden className="size-5" />
              </span>
              <div className="min-w-0 pt-0.5">
                <SheetTitle className="text-lg leading-tight">Subscription snapshot</SheetTitle>
                <SheetDescription className="mt-1.5">
                  Support view — Stripe ids and period boundaries from Mongo (webhook-synced).
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-2 sm:px-6">
            {detailLoading && detailRow === null ? (
              <div className="space-y-3 py-4">
                <Skeleton className="h-16 w-full max-w-full rounded-xl" />
                <Skeleton className="h-16 w-full max-w-full rounded-xl" />
                <Skeleton className="h-16 w-[92%] max-w-full rounded-xl" />
              </div>
            ) : null}
            {detailError !== null ? (
              <div
                className="border-destructive/35 bg-destructive/8 text-destructive flex gap-3 rounded-xl border p-3 text-sm"
                role="alert"
              >
                <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
                <p className="min-w-0 leading-snug">{detailError}</p>
              </div>
            ) : null}
            {detailRow !== null ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2.5">
                  <DetailField icon={Building2} label="Organization">
                    <span className="font-medium">{resolveTenantDisplayName(detailRow)}</span>
                    {detailRow.tenantIsActive === false ? (
                      <span className="text-muted-foreground mt-1 block text-xs">
                        Organization marked inactive
                      </span>
                    ) : null}
                  </DetailField>
                  <DetailField icon={Link2} label="Tenant id">
                    <span className="font-mono text-xs tracking-tight break-all">
                      {detailRow.tenantId}
                    </span>
                  </DetailField>
                  <DetailField icon={Activity} label="Status">
                    <span
                      className={`inline-flex w-fit items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${subscriptionStatusTone(detailRow.status)}`}
                    >
                      {detailRow.status}
                    </span>
                  </DetailField>
                  <DetailField icon={Layers} label="Plan key">
                    {detailRow.planKey.length > 0 ? detailRow.planKey : '—'}
                  </DetailField>
                </div>

                <Separator className="bg-border/70" />

                <div className="flex flex-col gap-2.5">
                  <p className="text-muted-foreground flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
                    <Link2 aria-hidden className="size-3.5" />
                    Stripe identifiers
                  </p>
                  <DetailField icon={UserRound} label="Customer">
                    <span className="font-mono text-xs break-all">
                      {detailRow.stripeCustomerId ?? '—'}
                    </span>
                  </DetailField>
                  <DetailField icon={Link2} label="Subscription">
                    <span className="font-mono text-xs break-all">
                      {detailRow.stripeSubscriptionId ?? '—'}
                    </span>
                  </DetailField>
                  <DetailField icon={Tag} label="Price">
                    <span className="font-mono text-xs break-all">{detailRow.stripePriceId ?? '—'}</span>
                  </DetailField>
                </div>

                <Separator className="bg-border/70" />

                <div className="flex flex-col gap-2.5">
                  <p className="text-muted-foreground flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
                    <CalendarRange aria-hidden className="size-3.5" />
                    Billing period
                  </p>
                  <DetailField icon={CalendarRange} label="Current period">
                    <span className="text-xs sm:text-sm">
                      {formatDateTime(detailRow.currentPeriodStart)} →{' '}
                      {formatDateTime(detailRow.currentPeriodEnd)}
                    </span>
                  </DetailField>
                  <DetailField icon={Ban} label="Cancel at period end">
                    {detailRow.cancelAtPeriodEnd ? 'Yes' : 'No'}
                  </DetailField>
                </div>

                <Separator className="bg-border/70" />

                <DetailField icon={History} label="Row timestamps">
                  <span className="text-xs">
                    <span className="block">Created {formatDateTime(detailRow.createdAt)}</span>
                    <span className="mt-1 block">Updated {formatDateTime(detailRow.updatedAt)}</span>
                  </span>
                </DetailField>
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
