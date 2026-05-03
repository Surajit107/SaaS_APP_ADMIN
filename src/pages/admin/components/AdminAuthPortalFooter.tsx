import { Separator } from '@/components/ui/separator';

/** Footer below the operator sign-in form — platform SPA only (no tenant login shortcuts). */
export function AdminAuthPortalFooter() {
  return (
    <div className="relative z-10">
      <Separator className="mx-4 sm:mx-8" />
      <div className="px-4 pb-4 pt-3 text-center sm:px-8 sm:pb-5 sm:pt-3.5">
        <p className="text-muted-foreground mx-auto max-w-md text-[10px] leading-snug sm:text-[11px]">
          Platform owner credentials are issued by your development or operations team. For a new
          account, credential rotation, or access issues, contact the team responsible for this
          deployment.
        </p>
      </div>
    </div>
  );
}
