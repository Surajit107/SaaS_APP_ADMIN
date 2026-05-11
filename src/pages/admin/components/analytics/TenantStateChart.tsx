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
import type { PlatformAnalyticsTotals } from '@/lib/api/types';

import { formatInteger } from './formatters';

interface TenantStateChartProps {
  totals: PlatformAnalyticsTotals | null;
}

const chartConfig: ChartConfig = {
  active: {
    label: 'Active',
    theme: { light: 'oklch(0.7 0.18 152)', dark: 'oklch(0.8 0.18 152)' },
  },
  pendingPurge: {
    label: 'Pending purge (TTL)',
    theme: { light: 'oklch(0.78 0.18 75)', dark: 'oklch(0.85 0.18 75)' },
  },
};

export function TenantStateChart({
  totals,
}: TenantStateChartProps): ReactElement {
  const dataset = useMemo(() => {
    if (!totals) {
      return [];
    }
    // Hard-deleted documents are removed entirely by the Mongo TTL index, so they
    // are not represented here — only active and queued-for-purge survive.
    return [
      { key: 'active', label: 'Active', value: totals.tenantsActive },
      {
        key: 'pendingPurge',
        label: 'Pending purge (TTL)',
        value: totals.tenantsPendingPurge,
      },
    ].filter((slice) => slice.value > 0);
  }, [totals]);

  const total = useMemo(
    () => dataset.reduce((acc, row) => acc + row.value, 0),
    [dataset],
  );

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Tenant lifecycle</CardTitle>
          <CardDescription>
            Active organizations vs those queued for the Mongo TTL purge. Live
            counts only — TTL hard-deletes documents once `purgeAt` elapses.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 px-2 pb-4 pt-2 sm:px-4">
        {dataset.length === 0 ? (
          <p className="text-muted-foreground py-12 text-sm" role="status">
            No tenant lifecycle data yet.
          </p>
        ) : (
          <>
            <ChartContainer
              className="mx-auto aspect-square h-56 w-full sm:h-60"
              config={chartConfig}
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel nameKey="key" />}
                />
                <Pie
                  data={dataset}
                  dataKey="value"
                  innerRadius="55%"
                  nameKey="key"
                  outerRadius="85%"
                  paddingAngle={2}
                  stroke="var(--background)"
                  strokeWidth={2}
                >
                  {dataset.map((slice) => (
                    <Cell fill={`var(--color-${slice.key})`} key={slice.key} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="grid w-full grid-cols-1 gap-1">
              {dataset.map((slice) => {
                const pct = total > 0 ? (slice.value / total) * 100 : 0;
                return (
                  <li
                    className="flex items-center justify-between gap-2 text-xs"
                    key={slice.key}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden
                        className="size-2.5 shrink-0 rounded-[3px]"
                        style={{ background: `var(--color-${slice.key})` }}
                      />
                      <span className="text-muted-foreground truncate">
                        {slice.label}
                      </span>
                    </span>
                    <span className="text-foreground font-medium tabular-nums">
                      {formatInteger(slice.value)}{' '}
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
