import { type ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';

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
import type { PlatformAnalyticsNewMrrBucket } from '@/lib/api/types';

import {
  formatCurrencyCompact,
  formatInteger,
  formatShortDay,
} from './formatters';

interface NewMrrChartProps {
  buckets: PlatformAnalyticsNewMrrBucket[];
  currency: string;
}

const chartConfig: ChartConfig = {
  newMrr: {
    label: 'New MRR',
    theme: {
      light: 'oklch(0.7 0.18 152)',
      dark: 'oklch(0.8 0.18 152)',
    },
  },
  newSubscriptions: {
    label: 'New subscriptions',
    theme: {
      light: 'oklch(0.66 0.22 282)',
      dark: 'oklch(0.78 0.20 282)',
    },
  },
};

export function NewMrrChart({
  buckets,
  currency,
}: NewMrrChartProps): ReactElement {
  const upperCurrency = currency.toUpperCase();
  const totalNewMrr = buckets.reduce((acc, b) => acc + b.newMrr, 0);
  const totalNewSubs = buckets.reduce((acc, b) => acc + b.newSubscriptions, 0);

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>New MRR added</CardTitle>
          <CardDescription>
            Monthly-normalized revenue contributed by tenants whose first
            subscription row was inserted in the selected window — proxy for
            run-rate growth, not realized cash flow ({upperCurrency}).
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-4 pt-2 sm:px-4">
        <div className="text-muted-foreground mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 px-2 text-xs sm:text-sm">
          <span>
            <span className="text-foreground font-semibold tabular-nums">
              {formatCurrencyCompact(totalNewMrr, currency)}
            </span>{' '}
            added in window
          </span>
          <span aria-hidden className="opacity-40">
            •
          </span>
          <span>
            <span className="text-foreground font-semibold tabular-nums">
              {formatInteger(totalNewSubs)}
            </span>{' '}
            new subscriptions
          </span>
        </div>
        <ChartContainer className="aspect-auto h-64 w-full" config={chartConfig}>
          <BarChart data={buckets} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="date"
              minTickGap={32}
              tickFormatter={formatShortDay}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              axisLine={false}
              tickFormatter={(value: number) =>
                formatCurrencyCompact(value, currency)
              }
              tickLine={false}
              tickMargin={6}
              width={48}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value: unknown) =>
                    typeof value === 'string' ? formatShortDay(value) : String(value)
                  }
                />
              }
              cursor={{ fill: 'var(--muted)', opacity: 0.35 }}
            />
            <Bar
              dataKey="newMrr"
              fill="var(--color-newMrr)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
