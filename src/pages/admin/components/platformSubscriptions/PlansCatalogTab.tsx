import { zodResolver } from '@hookform/resolvers/zod';
import {
  Archive,
  Banknote,
  Boxes,
  CalendarClock,
  CircleDollarSign,
  FilePenLine,
  Gauge,
  Layers,
  Loader2,
  Package,
  Pencil,
  Plus,
  Receipt,
  RefreshCw,
  Settings2,
  Shield,
  Sparkles,
  Tag,
  Trash2,
  Type,
} from 'lucide-react';
import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { PlatformTenantListSkeleton } from '@/pages/admin/components/PlatformTenantListSkeleton';
import {
  DELETE_PLATFORM_SUBSCRIPTION_PLAN,
  GET_PLATFORM_SUBSCRIPTION_PLANS_ADMIN,
  PATCH_PLATFORM_SUBSCRIPTION_PLAN,
  POST_PLATFORM_SUBSCRIPTION_PLAN,
} from '@/lib/api/Api';
import { getApiErrorMessage } from '@/lib/api/errorMessage';
import type {
  CreateSubscriptionPlanPayload,
  PlatformSubscriptionPlanCatalogRow,
  SubscriptionPlanFeaturesPayload,
  UpdateSubscriptionPlanPayload,
} from '@/lib/api/types';
import {
  createSubscriptionPlanFormSchema,
  type CreateSubscriptionPlanFormValues,
  updateSubscriptionPlanFormSchema,
  type UpdateSubscriptionPlanFormValues,
} from '@/lib/validation/platformSubscriptionPlanSchemas';

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function formatFeaturesSummary(
  features: PlatformSubscriptionPlanCatalogRow['features'],
): string {
  if (features === null || features === undefined) {
    return '—';
  }
  const parts: string[] = [];
  if (features.maxWorkspaces !== undefined) {
    parts.push(`${features.maxWorkspaces} ws`);
  }
  if (features.maxUsers !== undefined) {
    parts.push(`${features.maxUsers} users`);
  }
  if (features.maxFileAssets !== undefined) {
    parts.push(`${features.maxFileAssets} files`);
  }
  if (features.maxStorageMb !== undefined) {
    parts.push(`${features.maxStorageMb} MB`);
  }
  return parts.length > 0 ? parts.join(' · ') : '—';
}

function buildFeaturesFromCreate(
  v: CreateSubscriptionPlanFormValues,
): SubscriptionPlanFeaturesPayload | undefined {
  const out: SubscriptionPlanFeaturesPayload = {};
  if (v.maxWorkspaces !== undefined) {
    out.maxWorkspaces = v.maxWorkspaces;
  }
  if (v.maxUsers !== undefined) {
    out.maxUsers = v.maxUsers;
  }
  if (v.maxFileAssets !== undefined) {
    out.maxFileAssets = v.maxFileAssets;
  }
  if (v.maxStorageMb !== undefined) {
    out.maxStorageMb = v.maxStorageMb;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

const FEATURE_KEYS = [
  'maxWorkspaces',
  'maxUsers',
  'maxFileAssets',
  'maxStorageMb',
] as const;

function mergeFeaturesForUpdate(
  existing: PlatformSubscriptionPlanCatalogRow['features'],
  values: UpdateSubscriptionPlanFormValues,
): SubscriptionPlanFeaturesPayload | undefined {
  const prev = existing ?? {};
  const merged: SubscriptionPlanFeaturesPayload = { ...prev };
  let changed = false;
  for (const k of FEATURE_KEYS) {
    const next = values[k];
    if (next !== undefined && next !== prev[k]) {
      merged[k] = next;
      changed = true;
    }
  }
  return changed ? merged : undefined;
}

export function PlansCatalogTab(): ReactElement {
  const [plans, setPlans] = useState<PlatformSubscriptionPlanCatalogRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<PlatformSubscriptionPlanCatalogRow | null>(null);
  const [archivePlan, setArchivePlan] = useState<PlatformSubscriptionPlanCatalogRow | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const loadPlans = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await GET_PLATFORM_SUBSCRIPTION_PLANS_ADMIN({
        includeArchived: showArchived,
      });
      setPlans(res.data.data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Unable to load plan catalog'));
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  }, [showArchived]);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  const createForm = useForm<CreateSubscriptionPlanFormValues>({
    resolver: zodResolver(
      createSubscriptionPlanFormSchema,
    ) as Resolver<CreateSubscriptionPlanFormValues>,
    defaultValues: {
      name: '',
      amount: 0,
      interval: 'month',
      currency: '',
      trialDays: undefined,
      isTrialEnabled: false,
      maxWorkspaces: undefined,
      maxUsers: undefined,
      maxFileAssets: undefined,
      maxStorageMb: undefined,
    },
  });

  const editForm = useForm<UpdateSubscriptionPlanFormValues>({
    resolver: zodResolver(
      updateSubscriptionPlanFormSchema,
    ) as Resolver<UpdateSubscriptionPlanFormValues>,
    defaultValues: {},
  });

  useEffect(() => {
    if (editPlan === null) {
      return;
    }
    const f = editPlan.features ?? undefined;
    editForm.reset({
      name: editPlan.name,
      trialDays: editPlan.trialDays,
      isTrialEnabled: editPlan.isTrialEnabled,
      maxWorkspaces: f?.maxWorkspaces,
      maxUsers: f?.maxUsers,
      maxFileAssets: f?.maxFileAssets,
      maxStorageMb: f?.maxStorageMb,
    });
  }, [editPlan, editForm]);

  const onCreateSubmit = createForm.handleSubmit(async (values) => {
    const payload: CreateSubscriptionPlanPayload = {
      name: values.name.trim(),
      amount: values.amount,
      interval: values.interval,
      isTrialEnabled: values.isTrialEnabled ?? false,
      ...(values.currency !== undefined ? { currency: values.currency } : {}),
      ...(values.trialDays !== undefined ? { trialDays: values.trialDays } : {}),
    };
    const features = buildFeaturesFromCreate(values);
    if (features !== undefined) {
      payload.features = features;
    }
    setIsMutating(true);
    try {
      await POST_PLATFORM_SUBSCRIPTION_PLAN(payload);
      toast.success('Plan created in Stripe and catalog');
      setCreateOpen(false);
      createForm.reset({
        name: '',
        amount: 0,
        interval: 'month',
        currency: '',
        trialDays: undefined,
        isTrialEnabled: false,
        maxWorkspaces: undefined,
        maxUsers: undefined,
        maxFileAssets: undefined,
        maxStorageMb: undefined,
      });
      await loadPlans();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Unable to create plan'));
    } finally {
      setIsMutating(false);
    }
  });

  const onEditSubmit = editForm.handleSubmit(async (values) => {
    if (editPlan === null) {
      return;
    }
    const payload: UpdateSubscriptionPlanPayload = {};
    const trimmedName = values.name?.trim() ?? '';
    if (trimmedName.length > 0 && trimmedName !== editPlan.name) {
      payload.name = trimmedName;
    }
    if (values.trialDays !== undefined && values.trialDays !== editPlan.trialDays) {
      payload.trialDays = values.trialDays;
    }
    if (
      values.isTrialEnabled !== undefined &&
      values.isTrialEnabled !== editPlan.isTrialEnabled
    ) {
      payload.isTrialEnabled = values.isTrialEnabled;
    }
    const features = mergeFeaturesForUpdate(editPlan.features, values);
    if (features !== undefined) {
      payload.features = features;
    }
    if (Object.keys(payload).length === 0) {
      toast.message('No changes to save');
      return;
    }
    setIsMutating(true);
    try {
      await PATCH_PLATFORM_SUBSCRIPTION_PLAN(editPlan.id, payload);
      toast.success('Plan updated');
      setEditPlan(null);
      await loadPlans();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Unable to update plan'));
    } finally {
      setIsMutating(false);
    }
  });

  const confirmArchive = async (): Promise<void> => {
    if (archivePlan === null) {
      return;
    }
    setIsMutating(true);
    try {
      await DELETE_PLATFORM_SUBSCRIPTION_PLAN(archivePlan.id);
      toast.success('Plan archived');
      setArchivePlan(null);
      await loadPlans();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Unable to archive plan'));
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="border-border/70 rounded-2xl border bg-card/95 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 shadow-sm">
              <Settings2 aria-hidden className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-foreground inline-flex items-center gap-2 text-sm font-medium">
                <Sparkles aria-hidden className="text-muted-foreground size-3.5" />
                Catalog controls
              </p>
              <p className="text-muted-foreground mt-1 max-w-xl text-xs leading-relaxed">
                New versions use POST (immutable price/interval on existing rows). Archive uses Stripe
                deactivation via DELETE.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={showArchived}
                id="show-archived-plans"
                onCheckedChange={setShowArchived}
              />
              <Label className="inline-flex cursor-pointer items-center gap-1.5 font-normal" htmlFor="show-archived-plans">
                <Archive aria-hidden className="text-muted-foreground size-3.5" />
                Show archived
              </Label>
            </div>
            <Button
              onClick={() => {
                createForm.clearErrors();
                setCreateOpen(true);
              }}
              type="button"
            >
              <Plus aria-hidden className="mr-1 size-4" />
              New plan
            </Button>
          </div>
        </div>
      </section>

      {error !== null ? (
        <section className="border-destructive/40 bg-destructive/10 rounded-xl border px-4 py-3 text-sm shadow-sm">
          <p className="text-destructive font-medium">{error}</p>
          <Button
            className="mt-3"
            onClick={() => {
              void loadPlans();
            }}
            size="sm"
            type="button"
            variant="outline"
          >
            <RefreshCw aria-hidden className="mr-1.5 size-3.5" />
            Retry
          </Button>
        </section>
      ) : null}

      <section className="border-border/70 overflow-hidden rounded-2xl border bg-card/95 shadow-sm">
        <div className="border-border/60 flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 sm:px-5">
          <p className="text-muted-foreground inline-flex items-center gap-2 text-xs sm:text-sm">
            <Layers aria-hidden className="text-muted-foreground/80 size-4 shrink-0" />
            {isLoading ? (
              <Skeleton aria-hidden className="inline-block h-4 w-[min(14rem,100%)] max-w-full" />
            ) : (
              <span>
                {plans.length === 0
                  ? 'No plans in this view.'
                  : `${plans.length} plan${plans.length === 1 ? '' : 's'}`}
              </span>
            )}
          </p>
        </div>
        <div className="divide-border/60 divide-y">
          {isLoading ? <PlatformTenantListSkeleton rowCount={4} /> : null}
          {!isLoading && plans.length === 0 && error === null ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 px-4 py-10 text-center text-sm sm:px-5">
              <Package aria-hidden className="text-muted-foreground/50 size-8" />
              <span>No catalog rows.</span>
            </div>
          ) : null}
          {!isLoading
            ? plans.map((row) => {
                const archived = row.archived === true;
                return (
                  <div
                    key={row.id}
                    className={
                      archived
                        ? 'hover:bg-muted/30 border-muted flex flex-col gap-1 border-l-2 border-dashed px-4 py-3 pl-[calc(1rem-2px)] opacity-90 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:pl-[calc(1.25rem-2px)]'
                        : 'hover:bg-muted/30 flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5'
                    }
                  >
                    <div className="flex min-w-0 flex-1 gap-3 sm:items-start">
                      <span
                        className={
                          archived
                            ? 'bg-muted text-muted-foreground mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-dashed'
                            : 'bg-primary/8 text-primary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/15 shadow-xs'
                        }
                      >
                        {archived ? (
                          <Archive aria-hidden className="size-4 sm:size-[1.125rem]" />
                        ) : (
                          <Boxes aria-hidden className="size-4 sm:size-[1.125rem]" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <p className="text-foreground truncate text-sm font-medium">{row.name}</p>
                          {archived ? (
                            <span className="bg-muted text-muted-foreground inline-flex shrink-0 rounded-md px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide">
                              Archived
                            </span>
                          ) : null}
                        </div>
                        <p className="text-muted-foreground mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs">
                          <Tag aria-hidden className="text-muted-foreground/70 size-3 shrink-0" />
                          <span className="truncate">{row.id}</span>
                          <span className="text-muted-foreground/50">·</span>
                          <CalendarClock aria-hidden className="text-muted-foreground/70 size-3 shrink-0" />
                          <span>{row.interval}</span>
                          <span className="text-muted-foreground/50">·</span>
                          <CircleDollarSign aria-hidden className="text-muted-foreground/70 size-3 shrink-0" />
                          <span>{formatMoney(row.amount, row.currency)}</span>
                        </p>
                        <p className="text-muted-foreground/90 mt-1 flex items-center gap-1.5 text-xs">
                          <Gauge aria-hidden className="text-muted-foreground size-3.5 shrink-0" />
                          <span>Limits: {formatFeaturesSummary(row.features)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                      <Button
                        disabled={archived || isMutating}
                        onClick={() => setEditPlan(row)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Pencil aria-hidden className="mr-1 size-3.5" />
                        Edit
                      </Button>
                      <Button
                        className="text-destructive hover:text-destructive"
                        disabled={archived || isMutating}
                        onClick={() => setArchivePlan(row)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Trash2 aria-hidden className="mr-1 size-3.5" />
                        Archive
                      </Button>
                    </div>
                  </div>
                );
              })
            : null}
        </div>
      </section>

      <Sheet
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            createForm.clearErrors();
          }
        }}
      >
        <SheetContent className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <SheetHeader className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <span className="bg-primary/12 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 shadow-sm">
                <Receipt aria-hidden className="size-5" />
              </span>
              <div className="min-w-0 pt-0.5">
                <SheetTitle className="text-lg leading-tight">Create subscription plan</SheetTitle>
                <SheetDescription className="mt-1.5">
                  Creates Stripe Product + Price and a catalog document. Price and interval cannot be
                  changed later; ship a new plan instead.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <form className="flex flex-1 flex-col gap-4 px-4 pb-4 pt-2 sm:px-6" onSubmit={onCreateSubmit}>
            <div className="space-y-2">
              <Label className="inline-flex items-center gap-1.5" htmlFor="plan-name">
                <Type aria-hidden className="text-muted-foreground size-3.5" />
                Name
              </Label>
              <Input id="plan-name" {...createForm.register('name')} autoComplete="off" />
              {createForm.formState.errors.name ? (
                <p className="text-destructive text-xs">{createForm.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="inline-flex items-center gap-1.5" htmlFor="plan-amount">
                  <Banknote aria-hidden className="text-muted-foreground size-3.5" />
                  Amount (major units)
                </Label>
                <Input
                  id="plan-amount"
                  inputMode="decimal"
                  step="any"
                  type="number"
                  {...createForm.register('amount', { valueAsNumber: true })}
                />
                {createForm.formState.errors.amount ? (
                  <p className="text-destructive text-xs">{createForm.formState.errors.amount.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label className="inline-flex items-center gap-1.5">
                  <CalendarClock aria-hidden className="text-muted-foreground size-3.5" />
                  Interval
                </Label>
                <Select
                  value={createForm.watch('interval')}
                  onValueChange={(v) => {
                    createForm.setValue('interval', v as CreateSubscriptionPlanFormValues['interval'], {
                      shouldValidate: true,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="day">day</SelectItem>
                    <SelectItem value="week">week</SelectItem>
                    <SelectItem value="month">month</SelectItem>
                    <SelectItem value="year">year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="inline-flex items-center gap-1.5" htmlFor="plan-currency">
                <CircleDollarSign aria-hidden className="text-muted-foreground size-3.5" />
                Currency (optional)
              </Label>
              <Input
                id="plan-currency"
                placeholder="usd"
                {...createForm.register('currency')}
                autoComplete="off"
                maxLength={8}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="inline-flex items-center gap-1.5" htmlFor="plan-trial">
                  <CalendarClock aria-hidden className="text-muted-foreground size-3.5" />
                  Trial days
                </Label>
                <Input
                  id="plan-trial"
                  inputMode="numeric"
                  type="number"
                  {...createForm.register('trialDays')}
                />
              </div>
              <div className="flex items-end gap-2 pb-2">
                <Switch
                  checked={createForm.watch('isTrialEnabled') ?? false}
                  id="plan-trial-enabled"
                  onCheckedChange={(c) => createForm.setValue('isTrialEnabled', c)}
                />
                <Label
                  className="inline-flex cursor-pointer items-center gap-1.5 font-normal"
                  htmlFor="plan-trial-enabled"
                >
                  <Sparkles aria-hidden className="text-muted-foreground size-3.5" />
                  Trial enabled
                </Label>
              </div>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
              <Shield aria-hidden className="size-3.5" />
              Entitlements (optional)
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ['maxWorkspaces', 'Max workspaces'],
                  ['maxUsers', 'Max users'],
                  ['maxFileAssets', 'Max file assets'],
                  ['maxStorageMb', 'Max storage (MB)'],
                ] as const
              ).map(([key, label]) => (
                <div className="space-y-2" key={key}>
                  <Label className="inline-flex items-center gap-1.5" htmlFor={`plan-${key}`}>
                    <Gauge aria-hidden className="text-muted-foreground size-3.5" />
                    {label}
                  </Label>
                  <Input
                    id={`plan-${key}`}
                    inputMode="numeric"
                    type="number"
                    {...createForm.register(key)}
                  />
                </div>
              ))}
            </div>
            <SheetFooter className="mt-auto flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                disabled={isMutating}
                onClick={() => setCreateOpen(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={isMutating} type="submit">
                {isMutating ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Package aria-hidden className="mr-1.5 size-4" />
                )}
                Create plan
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet
        open={editPlan !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditPlan(null);
            editForm.clearErrors();
          }
        }}
      >
        <SheetContent className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <SheetHeader className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <span className="bg-primary/12 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 shadow-sm">
                <FilePenLine aria-hidden className="size-5" />
              </span>
              <div className="min-w-0 pt-0.5">
                <SheetTitle className="text-lg leading-tight">Edit plan metadata</SheetTitle>
                <SheetDescription className="mt-1.5">
                  Name, trial, and feature caps. Pricing changes require a new plan via Create.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <form className="flex flex-1 flex-col gap-4 px-4 pb-4 pt-2 sm:px-6" onSubmit={onEditSubmit}>
            <div className="space-y-2">
              <Label className="inline-flex items-center gap-1.5" htmlFor="edit-plan-name">
                <Type aria-hidden className="text-muted-foreground size-3.5" />
                Name
              </Label>
              <Input id="edit-plan-name" {...editForm.register('name')} autoComplete="off" />
              {editForm.formState.errors.name ? (
                <p className="text-destructive text-xs">{editForm.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label className="inline-flex items-center gap-1.5" htmlFor="edit-plan-trial">
                <CalendarClock aria-hidden className="text-muted-foreground size-3.5" />
                Trial days
              </Label>
              <Input
                id="edit-plan-trial"
                inputMode="numeric"
                type="number"
                {...editForm.register('trialDays')}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={editForm.watch('isTrialEnabled') ?? false}
                id="edit-plan-trial-enabled"
                onCheckedChange={(c) => editForm.setValue('isTrialEnabled', c, { shouldDirty: true })}
              />
              <Label
                className="inline-flex cursor-pointer items-center gap-1.5 font-normal"
                htmlFor="edit-plan-trial-enabled"
              >
                <Sparkles aria-hidden className="text-muted-foreground size-3.5" />
                Trial enabled
              </Label>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
              <Shield aria-hidden className="size-3.5" />
              Entitlements
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ['maxWorkspaces', 'Max workspaces'],
                  ['maxUsers', 'Max users'],
                  ['maxFileAssets', 'Max file assets'],
                  ['maxStorageMb', 'Max storage (MB)'],
                ] as const
              ).map(([key, label]) => (
                <div className="space-y-2" key={key}>
                  <Label className="inline-flex items-center gap-1.5" htmlFor={`edit-${key}`}>
                    <Gauge aria-hidden className="text-muted-foreground size-3.5" />
                    {label}
                  </Label>
                  <Input
                    id={`edit-${key}`}
                    inputMode="numeric"
                    type="number"
                    {...editForm.register(key)}
                  />
                </div>
              ))}
            </div>
            <SheetFooter className="mt-auto flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                disabled={isMutating}
                onClick={() => setEditPlan(null)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={isMutating || !editForm.formState.isDirty} type="submit">
                {isMutating ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <FilePenLine aria-hidden className="mr-1.5 size-4" />
                )}
                Save changes
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            setArchivePlan(null);
          }
        }}
        open={archivePlan !== null}
      >
        <AlertDialogContent size="default">
          <AlertDialogHeader className="sm:text-left">
            <AlertDialogTitle className="flex items-center gap-2.5">
              <span className="bg-destructive/12 text-destructive flex size-9 shrink-0 items-center justify-center rounded-lg border border-destructive/25">
                <Archive aria-hidden className="size-4" />
              </span>
              Archive this plan?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Deactivates the Stripe price/product and marks the catalog row archived. Existing
              subscriptions keep historical linkage; new checkouts should use a replacement plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
            <AlertDialogCancel disabled={isMutating} type="button">
              Cancel
            </AlertDialogCancel>
            <Button
              disabled={isMutating}
              onClick={() => {
                void confirmArchive();
              }}
              type="button"
              variant="destructive"
            >
              {isMutating ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Trash2 className="size-4" aria-hidden />
              )}
              Archive plan
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
