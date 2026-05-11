import { type ReactElement } from 'react';
import {
  Area,
  AreaChart,
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { PlatformAnalyticsTenantGrowthBucket } from '@/lib/api/types';

import { formatInteger, formatShortDay } from './formatters';

interface TenantGrowthChartProps {
  buckets: PlatformAnalyticsTenantGrowthBucket[];
}

const chartConfig: ChartConfig = {
  newTenants: {
    label: 'New tenants',
    theme: {
      light: 'oklch(0.66 0.22 282)',
      dark: 'oklch(0.78 0.20 282)',
    },
  },
  cumulativeTenants: {
    label: 'Cumulative',
    theme: {
      light: 'oklch(0.74 0.13 200)',
      dark: 'oklch(0.82 0.12 200)',
    },
  },
};

export function TenantGrowthChart({
  buckets,
}: TenantGrowthChartProps): ReactElement {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Tenant signups</CardTitle>
          <CardDescription>
            New organizations per day with running total — soft-deleted rows
            included so the historical line stays stable.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-3 pt-2 sm:px-4 sm:pb-4">
        <ChartContainer className="aspect-auto h-72 w-full" config={chartConfig}>
          <AreaChart data={buckets} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fill-newTenants" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--color-newTenants)" stopOpacity={0.55} />
                <stop offset="95%" stopColor="var(--color-newTenants)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="fill-cumulativeTenants" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--color-cumulativeTenants)" stopOpacity={0.45} />
                <stop offset="95%" stopColor="var(--color-cumulativeTenants)" stopOpacity={0.03} />
              </linearGradient>
            </defs>
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
              allowDecimals={false}
              axisLine={false}
              tickFormatter={(value: number) => formatInteger(value)}
              tickLine={false}
              tickMargin={6}
              width={32}
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
              cursor={{ stroke: 'var(--border)', strokeDasharray: '4 4' }}
            />
            <Area
              dataKey="cumulativeTenants"
              fill="url(#fill-cumulativeTenants)"
              fillOpacity={0.4}
              stackId="cumulative"
              stroke="var(--color-cumulativeTenants)"
              type="monotone"
            />
            <Area
              dataKey="newTenants"
              fill="url(#fill-newTenants)"
              fillOpacity={0.4}
              stackId="new"
              stroke="var(--color-newTenants)"
              type="monotone"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
