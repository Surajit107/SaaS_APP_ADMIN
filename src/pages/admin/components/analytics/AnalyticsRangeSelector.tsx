import { type ReactElement } from 'react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalyticsRangeSelectorProps {
  /** Currently selected range in days. */
  value: number;
  onChange: (days: number) => void;
  disabled?: boolean;
}

const PRESETS: ReadonlyArray<{ label: string; days: number; description: string }> = [
  { label: '7d', days: 7, description: 'Last 7 days' },
  { label: '30d', days: 30, description: 'Last 30 days' },
  { label: '90d', days: 90, description: 'Last 90 days' },
  { label: '180d', days: 180, description: 'Last 180 days' },
];

export function AnalyticsRangeSelector({
  value,
  onChange,
  disabled = false,
}: AnalyticsRangeSelectorProps): ReactElement {
  const handleValueChange = (next: string): void => {
    const parsed = Number(next);
    if (Number.isFinite(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <Tabs onValueChange={handleValueChange} value={String(value)}>
      <TabsList aria-label="Analytics time range">
        {PRESETS.map((preset) => (
          <TabsTrigger
            aria-label={preset.description}
            disabled={disabled}
            key={preset.days}
            value={String(preset.days)}
          >
            {preset.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
