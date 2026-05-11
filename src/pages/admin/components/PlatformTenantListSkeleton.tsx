import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_ROW_COUNT = 6;

type PlatformTenantListSkeletonProps = {
  rowCount?: number;
};

export function PlatformTenantListSkeleton({
  rowCount = DEFAULT_ROW_COUNT,
}: PlatformTenantListSkeletonProps) {
  return (
    <div aria-busy aria-label="Loading organizations" className="divide-border/60 divide-y">
      {Array.from({ length: rowCount }, (_, index) => (
        <div
          className="hover:bg-muted/20 flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          key={index}
        >
          <div className="flex min-w-0 flex-1 gap-3 sm:items-start">
            <Skeleton className="mt-0.5 size-4 shrink-0 rounded-full sm:size-[1.125rem]" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-[min(280px,72%)] max-w-full" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-3 w-40 max-w-full" />
                <Skeleton className="h-3 w-28 max-w-full" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            <Skeleton className="h-6 w-[5.5rem] rounded-md" />
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-24 rounded-md" />
            <Skeleton className="h-8 w-[4.5rem] rounded-md" />
            <Skeleton className="h-8 w-[5.5rem] rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
