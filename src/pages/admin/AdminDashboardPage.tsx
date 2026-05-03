export function AdminDashboardPage() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-4xl">
      <header className="mb-8 sm:mb-10">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          Today at a glance
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:mt-3 sm:text-base">
          Snapshot of organizations and people across the platform — live
          stats land here when you connect them.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        <li className="border-border bg-card group relative overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/16 via-emerald-500/6 to-transparent"
          />
          <div className="relative px-4 py-6 sm:px-6 sm:py-7">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-[0.12em]">
              Organizations onboard
            </p>
            <p className="text-foreground mt-3 text-4xl font-semibold tabular-nums tracking-tight">
              —
            </p>
            <p className="text-muted-foreground mt-3 text-xs leading-snug">
              Active teams connected to your platform
            </p>
          </div>
        </li>

        <li className="border-border bg-card group relative overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/16 via-amber-500/6 to-transparent"
          />
          <div className="relative px-4 py-6 sm:px-6 sm:py-7">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-[0.12em]">
              Recoveries pending
            </p>
            <p className="text-foreground mt-3 text-4xl font-semibold tabular-nums tracking-tight">
              —
            </p>
            <p className="text-muted-foreground mt-3 text-xs leading-snug">
              Spaces winding down gracefully
            </p>
          </div>
        </li>

        <li className="border-border bg-card group relative overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/16 via-sky-500/6 to-transparent"
          />
          <div className="relative px-4 py-6 sm:px-6 sm:py-7">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-[0.12em]">
              People total
            </p>
            <p className="text-foreground mt-3 text-4xl font-semibold tabular-nums tracking-tight">
              —
            </p>
            <p className="text-muted-foreground mt-3 text-xs leading-snug">
              Everyone across every workspace
            </p>
          </div>
        </li>
      </ul>
    </div>
  );
}
