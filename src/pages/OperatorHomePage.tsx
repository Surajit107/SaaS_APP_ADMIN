import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';

const platformAdminCardInner = cn(
  'bg-card hover:border-primary/40 group relative flex flex-col overflow-hidden rounded-2xl border border-primary/35 bg-gradient-to-br from-primary/[0.06] via-card to-card p-4 shadow-md shadow-primary/5 ring-1 ring-primary/20 transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/55 hover:shadow-lg hover:shadow-primary/10 sm:flex-row sm:items-start sm:gap-5 sm:p-5',
);

/** Welcome hub on `/` for the operator SPA — platform operator entry only. */
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
    <div className="from-primary/[0.08] via-background relative flex min-h-dvh flex-col overflow-hidden bg-gradient-to-b to-muted/25 px-3 py-4 sm:px-4 sm:py-5">
      <div
        className="home-ambient bg-primary/15 pointer-events-none absolute -top-24 left-1/2 size-[22rem] rounded-full blur-3xl sm:size-[26rem]"
        aria-hidden
      />
      <div className="relative z-[1] mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-5 lg:flex-row lg:items-center lg:gap-8 lg:py-1">
        <header className="w-full shrink-0 text-center lg:max-w-[20rem] lg:text-left xl:max-w-xs">
          <p
            className="home-reveal-up text-primary mb-1.5 inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] lg:justify-start"
            style={{ animationDelay: '40ms' }}
          >
            <Sparkles className="size-3 shrink-0" aria-hidden />
            <span>Powered by Asteriq.in</span>
          </p>
          <h1
            className="home-reveal-up text-foreground mb-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{ animationDelay: '110ms' }}
          >
            {hasAuthenticatedSession ? 'Welcome back,' : 'Platform operations,'}
            {'\u00A0'}
            <span className="from-primary via-primary/85 bg-gradient-to-r to-foreground/90 bg-clip-text text-transparent">
              {hasAuthenticatedSession
                ? 'pick up where you left off'
                : 'one secure entry'}
            </span>
          </h1>
          <p
            className="home-reveal-up text-muted-foreground text-pretty text-sm leading-snug sm:text-[0.95rem] lg:max-w-none"
            style={{ animationDelay: '180ms' }}
          >
            {hasAuthenticatedSession
              ? 'Your session is active — go straight to your dashboard.'
              : 'Sign in to manage the platform, tenants, and configuration.'}
          </p>
        </header>

        <div className="flex w-full min-w-0 flex-col gap-3 lg:max-w-2xl lg:flex-1">
          <Link
            className={cn(
              'home-reveal-card focus-visible:ring-ring w-full cursor-pointer rounded-2xl outline-none focus-visible:ring-[3px] focus-visible:ring-offset-2',
            )}
            style={{ animationDelay: '220ms' }}
            to={adminCard.to}
          >
            <article className={platformAdminCardInner}>
              <div className="text-primary mb-2 shrink-0 sm:mb-0">
                <div className="bg-primary/15 inline-flex size-10 items-center justify-center rounded-xl sm:size-11">
                  <Sparkles className="size-[1.15rem] sm:size-5" aria-hidden />
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-primary mb-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em]">
                  Platform operator
                </p>
                <h2 className="text-foreground text-lg font-semibold tracking-tight sm:text-xl">
                  {adminCard.title}
                </h2>
                <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-snug sm:text-sm">
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

      <footer
        className="home-reveal-up text-muted-foreground relative z-[1] mx-auto mt-auto max-w-md shrink-0 px-2 py-2 text-center text-[0.65rem] leading-snug sm:text-xs"
        style={{ animationDelay: '440ms' }}
      >
        Secure flows, purposeful layout, ready when you connect your systems.
      </footer>
    </div>
  );
}
