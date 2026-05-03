import { cn } from '@/lib/utils';

const baseField =
  'border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/35 h-10 w-full rounded-lg border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]';

export function authInputClassName(invalid: boolean): string {
  return cn(
    baseField,
    invalid &&
      'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30',
  );
}
