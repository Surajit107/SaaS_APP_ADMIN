import { useMemo, type ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
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
import type { PlatformAnalyticsPlanDistributionRow } from '@/lib/api/types';

import { formatCurrencyCompact, formatInteger } from './formatters';

interface PlanDistributionChartProps {
  rows: PlatformAnalyticsPlanDistributionRow[];
}

const COLORS: Array<{ light: string; dark: string }> = [
  { light: 'oklch(0.66 0.22 282)', dark: 'oklch(0.78 0.20 282)' },
  { light: 'oklch(0.74 0.13 200)', dark: 'oklch(0.82 0.12 200)' },
  { light: 'oklch(0.7 0.18 152)', dark: 'oklch(0.8 0.18 152)' },
  { light: 'oklch(0.78 0.18 75)', dark: 'oklch(0.85 0.18 75)' },
  { light: 'oklch(0.72 0.21 22)', dark: 'oklch(0.8 0.2 22)' },
];

export function PlanDistributionChart({
  rows,
}: PlanDistributionChartProps): ReactElement {
  const dataset = useMemo(
    () =>
      rows.map((row, idx) => ({
        ...row,
        key: row.planId ?? `unknown-${idx}`,
        colorKey: `plan-${idx % COLORS.length}`,
      })),
    [rows],
  );

  const chartConfig: ChartConfig = useMemo(() => {
    const cfg: ChartConfig = {
      monthlyRevenue: { label: 'Monthly revenue' },
      subscribers: { label: 'Subscribers' },
    };
    dataset.forEach((row, idx) => {
      cfg[row.colorKey] = {
        label: row.planName,
        theme: COLORS[idx % COLORS.length],
      };
    });
    return cfg;
  }, [dataset]);

  const dominantCurrency =
    dataset[0]?.currency.toUpperCase() ?? '—';

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Revenue by plan</CardTitle>
          <CardDescription>
            Active + trialing subscribers per plan with monthly-normalized
            revenue contribution ({dominantCurrency}). Plans in other currencies
            are listed but not summed cross-currency.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-4 pt-2 sm:px-4">
        {dataset.length === 0 ? (
          <p className="text-muted-foreground py-10 text-center text-sm" role="status">
            No active or trialing subscriptions in the catalog yet.
          </p>
        ) : (
          <ChartContainer
            className="aspect-auto h-80 w-full"
            config={chartConfig}
          >
            <BarChart
              data={dataset}
              layout="vertical"
              margin={{ top: 8, right: 56, left: 0, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis
                axisLine={false}
                tickFormatter={(value: number) =>
                  formatCurrencyCompact(value, dominantCurrency)
                }
                tickLine={false}
                tickMargin={6}
                type="number"
              />
              <YAxis
                axisLine={false}
                dataKey="planName"
                tickLine={false}
                tickMargin={6}
                type="category"
                width={120}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, item) => {
                      const row = item.payload as {
                        currency: string;
                        subscribers: number;
                      };
                      if (name === 'monthlyRevenue') {
                        return (
                          <div className="flex w-full items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              Monthly revenue
                            </span>
                            <span className="text-foreground font-mono font-medium tabular-nums">
                              {formatCurrencyCompact(
                                typeof value === 'number' ? value : 0,
                                row.currency,
                              )}
                            </span>
                          </div>
                        );
                      }
                      return (
                        <div className="flex w-full items-center justify-between gap-3">
                          <span className="text-muted-foreground">
                            Subscribers
                          </span>
                          <span className="text-foreground font-mono font-medium tabular-nums">
                            {formatInteger(row.subscribers)}
                          </span>
                        </div>
                      );
                    }}
                    indicator="dashed"
                  />
                }
                cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
              />
              <Bar
                dataKey="monthlyRevenue"
                fill="var(--color-plan-0)"
                radius={[4, 4, 4, 4]}
              >
                <LabelList
                  className="fill-foreground text-[0.7rem] font-medium tabular-nums"
                  dataKey="subscribers"
                  formatter={(value: unknown) =>
                    `${typeof value === 'number' ? formatInteger(value) : value} subs`
                  }
                  position="right"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
