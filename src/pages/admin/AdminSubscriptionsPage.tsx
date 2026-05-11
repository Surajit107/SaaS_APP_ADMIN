import { CreditCard, Layers, Wallet2 } from 'lucide-react';
import { useState, type ReactElement } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlansCatalogTab } from '@/pages/admin/components/platformSubscriptions/PlansCatalogTab';
import { SubscriptionsListTab } from '@/pages/admin/components/platformSubscriptions/SubscriptionsListTab';

export function AdminSubscriptionsPage(): ReactElement {
  const [tab, setTab] = useState('subscriptions');

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl space-y-6">
      <div>
        <h1 className="text-foreground flex flex-wrap items-center gap-2.5 text-xl font-semibold tracking-tight">
          <span className="bg-primary/12 text-primary flex size-10 items-center justify-center rounded-xl border border-primary/20 shadow-sm">
            <Wallet2 aria-hidden className="size-5" />
          </span>
          Subscriptions
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Cross-tenant billing rows from{' '}
          <code className="text-foreground bg-muted rounded px-1 py-0.5 text-xs">
            GET /platform/subscriptions
          </code>{' '}
          and catalog lifecycle on{' '}
          <code className="text-foreground bg-muted rounded px-1 py-0.5 text-xs">
            /platform/subscription-plans
          </code>
          . Platform admin only.
        </p>
      </div>

      <Tabs className="gap-6" onValueChange={setTab} value={tab}>
        <TabsList>
          <TabsTrigger value="subscriptions">
            <CreditCard aria-hidden className="size-4" />
            Billing rows
          </TabsTrigger>
          <TabsTrigger value="catalog">
            <Layers aria-hidden className="size-4" />
            Plan catalog
          </TabsTrigger>
        </TabsList>
        <TabsContent className="mt-0" value="subscriptions">
          <SubscriptionsListTab />
        </TabsContent>
        <TabsContent className="mt-0" value="catalog">
          <PlansCatalogTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
