import { useMemo, type ReactElement } from 'react';
import { Cell, Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { PlatformAnalyticsSubscriptionStatusSlice } from '@/lib/api/types';

import { formatInteger, humanizeSubscriptionStatus } from './formatters';

interface SubscriptionStatusChartProps {
  slices: PlatformAnalyticsSubscriptionStatusSlice[];
}

/**
 * Stable color mapping per known Stripe/Mongo subscription status. Unknown
 * statuses fall through to the neutral chart-5 token.
 */
const STATUS_COLORS: Record<string, { light: string; dark: string }> = {
  active: { light: 'oklch(0.68 0.18 152)', dark: 'oklch(0.78 0.18 152)' },
  trialing: { light: 'oklch(0.74 0.13 200)', dark: 'oklch(0.82 0.12 200)' },
  past_due: { light: 'oklch(0.78 0.18 75)', dark: 'oklch(0.85 0.18 75)' },
  unpaid: { light: 'oklch(0.7 0.18 35)', dark: 'oklch(0.78 0.18 35)' },
  incomplete: { light: 'oklch(0.75 0.13 60)', dark: 'oklch(0.82 0.13 60)' },
  incomplete_expired: {
    light: 'oklch(0.65 0.18 25)',
    dark: 'oklch(0.74 0.18 25)',
  },
  canceled: { light: 'oklch(0.65 0.21 22)', dark: 'oklch(0.74 0.2 22)' },
  paused: { light: 'oklch(0.7 0.05 270)', dark: 'oklch(0.78 0.05 270)' },
  inactive: { light: 'oklch(0.62 0 0)', dark: 'oklch(0.74 0 0)' },
};

const FALLBACK_COLOR = { light: 'oklch(0.7 0.04 280)', dark: 'oklch(0.78 0.04 280)' };

export function SubscriptionStatusChart({
  slices,
}: SubscriptionStatusChartProps): ReactElement {
  const dataset = useMemo(() => {
    return slices.map((slice) => ({
      ...slice,
      label: humanizeSubscriptionStatus(slice.status),
    }));
  }, [slices]);

  const total = useMemo(
    () => dataset.reduce((acc, row) => acc + row.count, 0),
    [dataset],
  );

  const chartConfig: ChartConfig = useMemo(() => {
    const cfg: ChartConfig = {
      count: { label: 'Subscriptions' },
    };
    for (const slice of dataset) {
      const colors = STATUS_COLORS[slice.status] ?? FALLBACK_COLOR;
      cfg[slice.status] = {
        label: slice.label,
        theme: colors,
      };
    }
    return cfg;
  }, [dataset]);

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Subscription health mix</CardTitle>
          <CardDescription>
            Live histogram of every billing row in Mongo. Synced from Stripe
            webhook events.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 px-2 pb-4 pt-2 sm:px-4">
        {total === 0 ? (
          <p className="text-muted-foreground py-12 text-sm" role="status">
            No subscriptions yet — chart will populate after the first Stripe
            webhook syncs a row.
          </p>
        ) : (
          <>
            <ChartContainer
              className="mx-auto aspect-square h-60 w-full sm:h-64"
              config={chartConfig}
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      nameKey="status"
                    />
                  }
                />
                <Pie
                  data={dataset}
                  dataKey="count"
                  innerRadius="55%"
                  nameKey="status"
                  outerRadius="85%"
                  paddingAngle={2}
                  stroke="var(--background)"
                  strokeWidth={2}
                >
                  {dataset.map((slice) => (
                    <Cell
                      fill={`var(--color-${slice.status})`}
                      key={slice.status}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="grid w-full grid-cols-1 gap-1 sm:grid-cols-2">
              {dataset.map((slice) => {
                const pct = total > 0 ? (slice.count / total) * 100 : 0;
                return (
                  <li
                    className="flex items-center justify-between gap-2 text-xs"
                    key={slice.status}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden
                        className="size-2.5 shrink-0 rounded-[3px]"
                        style={{ background: `var(--color-${slice.status})` }}
                      />
                      <span className="text-muted-foreground truncate">
                        {slice.label}
                      </span>
                    </span>
                    <span className="text-foreground font-medium tabular-nums">
                      {formatInteger(slice.count)}{' '}
                      <span className="text-muted-foreground">
                        ({pct.toFixed(0)}%)
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
