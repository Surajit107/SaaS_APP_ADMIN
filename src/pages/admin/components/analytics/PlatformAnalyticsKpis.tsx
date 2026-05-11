import { type ReactElement } from 'react';
import { CircleCheck, CircleX, DollarSign, TrendingUp, TriangleAlert, Users2 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import type { PlatformAnalyticsTotals } from '@/lib/api/types';

import {
  formatCurrency,
  formatCurrencyCompact,
  formatInteger,
} from './formatters';

interface KpiCardProps {
  label: string;
  value: string;
  hint: string;
  Icon: typeof DollarSign;
  gradientClass: string;
  iconWrapperClass: string;
}

function KpiCard({
  label,
  value,
  hint,
  Icon,
  gradientClass,
  iconWrapperClass,
}: KpiCardProps): ReactElement {
  return (
    <li className="h-full list-none">
      <Card className="group relative h-full overflow-hidden rounded-2xl shadow-md transition-shadow hover:shadow-lg">
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradientClass}`}
        />
        <CardContent className="relative flex h-full items-start justify-between gap-3 px-4 py-5 sm:px-5 sm:py-6">
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-[0.65rem] font-medium uppercase tracking-[0.12em] sm:text-xs">
              {label}
            </p>
            <p className="text-foreground mt-2 text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
              {value}
            </p>
            <p className="text-muted-foreground mt-2 text-[0.7rem] leading-snug sm:text-xs">
              {hint}
            </p>
          </div>
          <span
            aria-hidden
            className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${iconWrapperClass}`}
          >
            <Icon className="size-4" />
          </span>
        </CardContent>
      </Card>
    </li>
  );
}

interface PlatformAnalyticsKpisProps {
  totals: PlatformAnalyticsTotals | null;
  isLoading: boolean;
}

const PLACEHOLDER = '—';

function valueOrPlaceholder(value: string, isLoading: boolean): string {
  if (isLoading) {
    return '…';
  }
  return value;
}

export function PlatformAnalyticsKpis({
  totals,
  isLoading,
}: PlatformAnalyticsKpisProps): ReactElement {
  const dominant =
    totals?.revenue.find((row) => row.currency === totals?.dominantCurrency) ??
    totals?.revenue[0] ??
    null;
  const mrrLabel = dominant
    ? formatCurrencyCompact(dominant.mrr, dominant.currency)
    : PLACEHOLDER;
  const arrLabel = dominant
    ? formatCurrency(dominant.arr, dominant.currency)
    : PLACEHOLDER;
  const activeSubsLabel = totals
    ? formatInteger(totals.subscriptionsActive)
    : PLACEHOLDER;
  const atRiskLabel = totals
    ? formatInteger(totals.subscriptionsAtRisk)
    : PLACEHOLDER;
  const canceledLabel = totals
    ? formatInteger(totals.subscriptionsCanceled)
    : PLACEHOLDER;
  const peopleLabel = totals ? formatInteger(totals.userCount) : PLACEHOLDER;

  const dominantCurrencyTag =
    dominant?.currency.toUpperCase() ?? '—';

  return (
    <ul className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <KpiCard
        Icon={DollarSign}
        gradientClass="from-emerald-500/16 via-emerald-500/6 to-transparent"
        hint={`Monthly run-rate (active + trialing, ${dominantCurrencyTag})`}
        iconWrapperClass="bg-emerald-500/14 text-emerald-500"
        label="MRR"
        value={valueOrPlaceholder(mrrLabel, isLoading && totals === null)}
      />
      <KpiCard
        Icon={TrendingUp}
        gradientClass="from-sky-500/16 via-sky-500/6 to-transparent"
        hint={`Annual run-rate (MRR × 12, ${dominantCurrencyTag})`}
        iconWrapperClass="bg-sky-500/14 text-sky-500"
        label="ARR"
        value={valueOrPlaceholder(arrLabel, isLoading && totals === null)}
      />
      <KpiCard
        Icon={CircleCheck}
        gradientClass="from-indigo-500/16 via-indigo-500/6 to-transparent"
        hint="Active + trialing tenants paying or in trial"
        iconWrapperClass="bg-indigo-500/14 text-indigo-500"
        label="Active subs"
        value={valueOrPlaceholder(
          activeSubsLabel,
          isLoading && totals === null,
        )}
      />
      <KpiCard
        Icon={TriangleAlert}
        gradientClass="from-amber-500/16 via-amber-500/6 to-transparent"
        hint="Past-due, unpaid, incomplete or paused — needs intervention"
        iconWrapperClass="bg-amber-500/14 text-amber-500"
        label="At-risk subs"
        value={valueOrPlaceholder(atRiskLabel, isLoading && totals === null)}
      />
      <KpiCard
        Icon={CircleX}
        gradientClass="from-rose-500/16 via-rose-500/6 to-transparent"
        hint="Canceled subscriptions (Stripe-confirmed)"
        iconWrapperClass="bg-rose-500/14 text-rose-500"
        label="Canceled subs"
        value={valueOrPlaceholder(canceledLabel, isLoading && totals === null)}
      />
      <KpiCard
        Icon={Users2}
        gradientClass="from-violet-500/16 via-violet-500/6 to-transparent"
        hint="All user accounts across every tenant"
        iconWrapperClass="bg-violet-500/14 text-violet-500"
        label="People total"
        value={valueOrPlaceholder(peopleLabel, isLoading && totals === null)}
      />
    </ul>
  );
}
