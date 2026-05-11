import { useCallback, useEffect, useMemo, type ReactElement } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  platformAnalyticsSyncRequested,
  platformOverviewSyncRequested,
} from '@/features/platform/saga/platformSaga';
import { platformAnalyticsDaysUpdated } from '@/features/platform/slice/platformAnalyticsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { AnalyticsRangeSelector } from './components/analytics/AnalyticsRangeSelector';
import { NewMrrChart } from './components/analytics/NewMrrChart';
import { PlanDistributionChart } from './components/analytics/PlanDistributionChart';
import { PlatformAnalyticsKpis } from './components/analytics/PlatformAnalyticsKpis';
import { SubscriptionStatusChart } from './components/analytics/SubscriptionStatusChart';
import { TenantGrowthChart } from './components/analytics/TenantGrowthChart';
import { TenantStateChart } from './components/analytics/TenantStateChart';

function formatRelativeTimestamp(iso: string | null): string {
  if (iso === null) {
    return '—';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

export function AdminDashboardPage(): ReactElement {
  const dispatch = useAppDispatch();
  const { data, isLoading, isRefreshing, error, lastUpdatedAt, days } =
    useAppSelector((s) => s.platformAnalytics);

  // Keep the legacy /platform/overview call so the existing slice + KPIs stay
  // populated for any consumer that reads it; analytics endpoint is the new
  // source of truth for the dashboard graphs.
  useEffect(() => {
    dispatch(platformOverviewSyncRequested());
    dispatch(platformAnalyticsSyncRequested({ days }));
    // We only want to seed once on mount; subsequent fetches are driven by user
    // actions (range change / explicit refresh).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleRangeChange = useCallback(
    (nextDays: number) => {
      dispatch(platformAnalyticsDaysUpdated(nextDays));
      dispatch(platformAnalyticsSyncRequested({ days: nextDays }));
    },
    [dispatch],
  );

  const handleRefresh = useCallback(() => {
    dispatch(platformOverviewSyncRequested());
    dispatch(platformAnalyticsSyncRequested({ days }));
  }, [dispatch, days]);

  const totals = data?.totals ?? null;
  const dominantCurrency = totals?.dominantCurrency ?? 'usd';
  const lastUpdatedLabel = useMemo(
    () => formatRelativeTimestamp(lastUpdatedAt),
    [lastUpdatedAt],
  );

  const isBusy = isLoading || isRefreshing;

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6 sm:space-y-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1.5">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
              Platform analytics
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed sm:text-[0.95rem]">
              Live aggregations from{' '}
              <code className="text-foreground bg-muted rounded px-1 py-0.5 text-[0.7rem]">
                GET /platform/analytics
              </code>
              . MRR/ARR are derived from active + trialing subs joined to the
              plan catalog — billable run-rate, not realized cash flow.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AnalyticsRangeSelector
              disabled={isBusy}
              onChange={handleRangeChange}
              value={days}
            />
            <Button
              aria-busy={isBusy}
              disabled={isBusy}
              onClick={handleRefresh}
              size="sm"
              variant="outline"
            >
              {isRefreshing ? (
                <Loader2 aria-hidden className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw aria-hidden className="size-3.5" />
              )}
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span>
            Window: last{' '}
            <span className="text-foreground font-semibold tabular-nums">
              {days}
            </span>{' '}
            day{days === 1 ? '' : 's'}
          </span>
          <span aria-hidden className="opacity-40">
            •
          </span>
          <span>
            Updated:{' '}
            <span className="text-foreground tabular-nums">
              {lastUpdatedLabel}
            </span>
          </span>
        </div>
        {error !== null ? (
          <p
            className="border-destructive/40 bg-destructive/8 text-destructive rounded-lg border px-3 py-2 text-sm"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </header>

      <PlatformAnalyticsKpis isLoading={isLoading} totals={totals} />

      <section
        aria-labelledby="trend-charts-heading"
        className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5"
      >
        <h2 className="sr-only" id="trend-charts-heading">
          Growth and revenue trends
        </h2>
        <div className="lg:col-span-2">
          <TenantGrowthChart buckets={data?.tenantGrowth ?? []} />
        </div>
        <div>
          <TenantStateChart totals={totals} />
        </div>
      </section>

      <section
        aria-labelledby="revenue-charts-heading"
        className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5"
      >
        <h2 className="sr-only" id="revenue-charts-heading">
          Subscription distribution
        </h2>
        <div className="lg:col-span-2">
          <PlanDistributionChart rows={data?.planDistribution ?? []} />
        </div>
        <div>
          <SubscriptionStatusChart slices={data?.subscriptionStatus ?? []} />
        </div>
      </section>

      <section aria-labelledby="new-mrr-heading">
        <h2 className="sr-only" id="new-mrr-heading">
          New MRR added
        </h2>
        <NewMrrChart
          buckets={data?.newMrrByDay ?? []}
          currency={dominantCurrency}
        />
      </section>
    </div>
  );
}
