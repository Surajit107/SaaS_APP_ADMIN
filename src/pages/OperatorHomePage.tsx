import { Link } from 'react-router-dom';
import {
  AppWindow,
  ArrowRight,
  Bot,
  Building2,
  Cable,
  CreditCard,
  Gauge,
  LayoutDashboard,
  Network,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';

const platformAdminCardInner = cn(
  'bg-card hover:border-primary/40 group relative flex flex-col overflow-hidden rounded-2xl border border-primary/35 bg-gradient-to-br from-primary/[0.06] via-card to-card p-4 shadow-md shadow-primary/5 ring-1 ring-primary/20 transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/55 hover:shadow-lg hover:shadow-primary/10 sm:flex-row sm:items-start sm:gap-5 sm:p-5',
);

type EcosystemCapability = {
  icon: LucideIcon;
  /** Muted icon tile — distinct per capability, works in light and dark UI. */
  iconWrapClass: string;
  title: string;
  summary: string;
  bullets: readonly string[];
  /** Shown when the operator session is active — deep-link into the product. */
  deepLink?: { to: string; label: string };
};

const ECOSYSTEM_CAPABILITIES: readonly EcosystemCapability[] = [
  {
    icon: Building2,
    iconWrapClass:
      'bg-sky-500/12 text-sky-700 shadow-sm shadow-sky-500/10 dark:bg-sky-400/12 dark:text-sky-300 dark:shadow-sky-950/20',
    title: 'Tenant directory',
    summary: 'Single source of truth for every organization on the platform.',
    bullets: [
      'Onboard and track tenants from first signup through production usage.',
      'Keep ownership, billing, and lifecycle state aligned in one console.',
    ],
    deepLink: { to: '/admin/tenants', label: 'Open tenants' },
  },
  {
    icon: CreditCard,
    iconWrapClass:
      'bg-emerald-500/12 text-emerald-800 shadow-sm shadow-emerald-500/10 dark:bg-emerald-400/12 dark:text-emerald-300 dark:shadow-emerald-950/20',
    title: 'Plans & subscriptions',
    summary: 'Commercial controls that mirror what customers see in the main app.',
    bullets: [
      'Curate catalog offers, intervals, and entitlements before they reach tenants.',
      'Stay aligned with checkout, renewals, and cancellation flows.',
    ],
    deepLink: { to: '/admin/subscriptions', label: 'Open subscriptions' },
  },
  {
    icon: LayoutDashboard,
    iconWrapClass:
      'bg-indigo-500/12 text-indigo-800 shadow-sm shadow-indigo-500/10 dark:bg-indigo-400/12 dark:text-indigo-300 dark:shadow-indigo-950/20',
    title: 'Control-center dashboard',
    summary: 'Cross-tenant visibility for operators who run the business day to day.',
    bullets: [
      'Land on the metrics and shortcuts that matter for platform health.',
      'Jump into detail routes without hunting through bookmarks.',
    ],
    deepLink: { to: '/admin/dashboard', label: 'Open dashboard' },
  },
  {
    icon: Bot,
    iconWrapClass:
      'bg-violet-500/12 text-violet-800 shadow-sm shadow-violet-500/10 dark:bg-violet-400/12 dark:text-violet-300 dark:shadow-violet-950/20',
    title: 'AI assistant',
    summary: 'Operational copilot tuned to how your team actually works the console.',
    bullets: [
      'Ask platform questions in natural language instead of re-reading runbooks.',
      'Use it as a second pair of eyes when diagnosing tenant issues.',
    ],
    deepLink: { to: '/admin/ai-chatbot', label: 'Open AI assistant' },
  },
  {
    icon: Network,
    iconWrapClass:
      'bg-cyan-500/12 text-cyan-800 shadow-sm shadow-cyan-500/10 dark:bg-cyan-400/12 dark:text-cyan-300 dark:shadow-cyan-950/20',
    title: 'Connected surfaces',
    summary: 'This operator SPA is one layer of a larger system.',
    bullets: [
      'Tenants live in the main application: workspaces, users, and boards.',
      'Stripe-backed billing pages return customers to predictable URLs after checkout.',
    ],
  },
  {
    icon: ShieldCheck,
    iconWrapClass:
      'bg-slate-500/12 text-slate-800 shadow-sm shadow-slate-500/10 dark:bg-slate-400/12 dark:text-slate-200 dark:shadow-slate-950/30',
    title: 'Trust posture',
    summary: 'Designed for a small, high-privilege group — not a self-serve signup wall.',
    bullets: [
      'Invitation-only access keeps blast radius low.',
      'Session-backed flows match how serious B2B SaaS expects auth to behave.',
    ],
  },
] as const;

const SURFACE_STRIP = [
  {
    icon: AppWindow,
    iconWrapClass:
      'bg-sky-500/12 text-sky-800 shadow-sm shadow-sky-500/10 dark:bg-sky-400/12 dark:text-sky-200 dark:shadow-sky-950/20',
    title: 'Main application',
    body: 'Where tenant admins and invited members collaborate — workspaces, people, and day-to-day work.',
  },
  {
    icon: Gauge,
    iconWrapClass:
      'bg-indigo-500/12 text-indigo-800 shadow-sm shadow-indigo-500/10 dark:bg-indigo-400/12 dark:text-indigo-200 dark:shadow-indigo-950/20',
    title: 'Operator console',
    body: 'This admin experience — catalog, tenants, subscriptions, and platform-wide tooling.',
  },
  {
    icon: Cable,
    iconWrapClass:
      'bg-emerald-500/12 text-emerald-800 shadow-sm shadow-emerald-500/10 dark:bg-emerald-400/12 dark:text-emerald-200 dark:shadow-emerald-950/20',
    title: 'Billing & webhooks',
    body: 'Hosted checkout and return URLs wire revenue events back into tenant state and entitlements.',
  },
] as const;

/** Welcome hub on `/` for the operator SPA — ecosystem overview plus entry to the console. */
export function OperatorHomePage() {
  const isAdminAuthenticated = useAppSelector((state) => state.adminAuth.isAuthenticated);
  const hasAuthenticatedSession = isAdminAuthenticated;

  const adminCard = isAdminAuthenticated
    ? {
        to: '/admin/dashboard',
        title: 'Platform control center',
        description: 'Signed in as an operator — open the platform dashboard.',
        cta: 'Open admin dashboard',
      }
    : {
        to: '/admin/login',
        title: 'I run the platform',
        description:
          'Owner console for the team that sells and runs the product — invitation only.',
        cta: 'Continue to operator sign-in',
      };

  return (
    <div className="from-primary/[0.08] via-background relative flex min-h-dvh flex-col overflow-x-hidden bg-gradient-to-b to-muted/25 px-3 py-4 sm:px-4 sm:py-6">
      <div
        className="home-ambient bg-primary/15 pointer-events-none absolute -top-24 left-1/2 size-[22rem] rounded-full blur-3xl sm:size-[26rem]"
        aria-hidden
      />

      <main className="relative z-[1] mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 pb-8 lg:gap-12 lg:pb-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(100%,22rem)] lg:items-start lg:gap-10">
          <header className="w-full min-w-0 text-center lg:pt-1 lg:text-left">
            <p
              className="home-reveal-up text-primary mb-2 inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] lg:justify-start"
              style={{ animationDelay: '40ms' }}
            >
              <Sparkles className="size-3 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
              <span>Powered by Asteriq.in</span>
              <Badge className="ml-0.5 font-mono text-[0.6rem] tracking-wide" variant="secondary">
                Operator
              </Badge>
            </p>
            <h1
              className="home-reveal-up text-foreground mb-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
              style={{ animationDelay: '110ms' }}
            >
              {hasAuthenticatedSession ? 'Welcome back —' : 'One ecosystem,'}
              {'\u00A0'}
              <span className="from-primary via-primary/85 bg-gradient-to-r to-foreground/90 bg-clip-text text-transparent">
                {hasAuthenticatedSession
                  ? 'everything the platform runs'
                  : 'designed as a system'}
              </span>
            </h1>
            <p
              className="home-reveal-up text-muted-foreground mx-auto max-w-2xl text-pretty text-sm leading-relaxed sm:text-[0.95rem] lg:mx-0 lg:max-w-none"
              style={{ animationDelay: '180ms' }}
            >
              {hasAuthenticatedSession
                ? 'Use this page as a quick map of what the operator console covers, then dive back into tenants, billing, or automation.'
                : 'The operator experience sits alongside the main tenant application: same product vision, different privileges. Sign in when you are ready to manage the fleet.'}
            </p>
          </header>

          <div className="lg:sticky lg:top-6">
            <Link
              className={cn(
                'home-reveal-card focus-visible:ring-ring block w-full cursor-pointer rounded-2xl outline-none focus-visible:ring-[3px] focus-visible:ring-offset-2',
              )}
              style={{ animationDelay: '220ms' }}
              to={adminCard.to}
            >
              <article className={platformAdminCardInner}>
                <div className="mb-2 shrink-0 text-indigo-700 dark:text-indigo-300 sm:mb-0">
                  <div className="inline-flex size-10 items-center justify-center rounded-xl bg-indigo-500/12 shadow-sm shadow-indigo-500/10 dark:bg-indigo-400/12 dark:shadow-indigo-950/20 sm:size-11">
                    <Gauge className="size-[1.15rem] text-indigo-700 sm:size-5 dark:text-indigo-200" aria-hidden />
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-primary mb-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em]">
                    Primary entry
                  </p>
                  <h2 className="text-foreground text-lg font-semibold tracking-tight sm:text-xl">
                    {adminCard.title}
                  </h2>
                  <p className="text-muted-foreground mt-1 text-xs leading-snug sm:text-sm">
                    {adminCard.description}
                  </p>
                  <span className="text-primary group-hover:text-primary/90 mt-3 inline-flex items-center gap-1.5 text-xs font-semibold sm:text-sm">
                    {adminCard.cta}
                    <ArrowRight
                      className="size-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1 sm:size-4"
                      aria-hidden
                    />
                  </span>
                </div>
              </article>
            </Link>
          </div>
        </div>

        <section aria-labelledby="ecosystem-surfaces-heading" className="home-reveal-up space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2
              id="ecosystem-surfaces-heading"
              className="text-foreground text-lg font-semibold tracking-tight sm:text-xl"
            >
              How the surfaces fit together
            </h2>
            <p className="text-muted-foreground max-w-xl text-xs leading-snug sm:text-right sm:text-[0.8rem]">
              Operators orchestrate the fleet; tenants consume the product. Billing glue keeps both honest.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {SURFACE_STRIP.map((surface) => {
              const SurfaceIcon = surface.icon;
              return (
              <Card
                key={surface.title}
                className="border-border/70 bg-card/80 shadow-sm backdrop-blur-sm"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-xl',
                        surface.iconWrapClass,
                      )}
                    >
                      <SurfaceIcon className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <CardTitle className="text-base leading-snug">{surface.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">{surface.body}</p>
                </CardContent>
              </Card>
              );
            })}
          </div>
        </section>

        <Separator className="bg-border/60" />

        <section aria-labelledby="capabilities-heading" className="space-y-5">
          <div className="space-y-1.5">
            <h2
              id="capabilities-heading"
              className="home-reveal-up text-foreground text-lg font-semibold tracking-tight sm:text-xl"
            >
              Operator console capabilities
            </h2>
            <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
              Each card maps to real routes and workflows in this deployment — not a marketing landing page detached
              from the product.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ECOSYSTEM_CAPABILITIES.map((item, index) => {
              const Icon = item.icon;
              const showDeepLink = Boolean(isAdminAuthenticated && item.deepLink);
              return (
                <Card
                  key={item.title}
                  className={cn(
                    'home-reveal-card flex h-full min-h-0 flex-col border-border/70 bg-card/85 overflow-hidden shadow-sm backdrop-blur-sm',
                  )}
                  style={{ animationDelay: `${260 + index * 45}ms` }}
                >
                  {/*
                    CardHeader defaults to flex-row + wrap; short titles then sit beside the icon.
                    Force a single column so title + summary always start below the icon (same for every card).
                  */}
                  <CardHeader className="flex flex-col flex-nowrap items-start gap-3 border-b border-border/40 bg-muted/10 px-4 py-4">
                    <span
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-xl',
                        item.iconWrapClass,
                      )}
                    >
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div className="w-full min-w-0 space-y-1">
                      <CardTitle className="text-base leading-snug">{item.title}</CardTitle>
                      <p className="text-muted-foreground text-[0.8rem] leading-snug">{item.summary}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col px-4 py-4">
                    <ul className="text-muted-foreground list-inside list-disc space-y-1.5 text-xs leading-relaxed sm:text-sm">
                      {item.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                    <div className="mt-auto flex min-h-9 shrink-0 items-center pt-3">
                      {showDeepLink && item.deepLink ? (
                        <Link
                          className="text-primary inline-flex items-center gap-1 text-xs font-semibold hover:underline sm:text-sm"
                          to={item.deepLink.to}
                        >
                          {item.deepLink.label}
                          <ArrowRight className="size-3.5" aria-hidden />
                        </Link>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      <footer
        className="home-reveal-up text-muted-foreground relative z-[1] mx-auto mt-auto max-w-2xl shrink-0 px-2 py-3 text-center text-[0.65rem] leading-relaxed sm:text-xs"
        style={{ animationDelay: '440ms' }}
      >
        Secure flows, purposeful layout, ready when you connect your systems — operator-grade UX for the team that
        ships and supports the product.
      </footer>
    </div>
  );
}
