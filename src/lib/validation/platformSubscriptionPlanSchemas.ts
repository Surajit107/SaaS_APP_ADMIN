import { z } from 'zod';

export const billingIntervalSchema = z.enum(['day', 'week', 'month', 'year']);

/** RHF + HTML inputs: empty string or missing → undefined; avoids `z.preprocess` / `z.coerce` input typing as `unknown` with Zod 4 + zodResolver. */
const formNumberish = z.union([z.string(), z.number(), z.null(), z.undefined()]);

function optionalNonNegNumber() {
  return formNumberish
    .transform((v): number | undefined => {
      if (v === '' || v === null || v === undefined) {
        return undefined;
      }
      if (typeof v === 'number') {
        return Number.isFinite(v) ? v : undefined;
      }
      const t = v.trim();
      if (t.length === 0) {
        return undefined;
      }
      const n = Number(t);
      return Number.isFinite(n) ? n : undefined;
    })
    .pipe(z.union([z.undefined(), z.number().min(0)]));
}

function requiredNonNegAmount() {
  return formNumberish
    .transform((v): number => {
      if (typeof v === 'number' && Number.isFinite(v)) {
        return v;
      }
      if (typeof v === 'string') {
        const t = v.trim();
        if (t.length === 0) {
          return NaN;
        }
        return Number(t);
      }
      return NaN;
    })
    .pipe(z.number().min(0, 'Amount must be at least 0'));
}

export const createSubscriptionPlanFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(256),
  amount: requiredNonNegAmount(),
  interval: billingIntervalSchema,
  currency: z
    .string()
    .trim()
    .max(8)
    .transform((c) => (c.length > 0 ? c.toLowerCase() : undefined)),
  trialDays: optionalNonNegNumber(),
  isTrialEnabled: z.boolean().optional(),
  maxWorkspaces: optionalNonNegNumber(),
  maxUsers: optionalNonNegNumber(),
  maxFileAssets: optionalNonNegNumber(),
  maxStorageMb: optionalNonNegNumber(),
});

export type CreateSubscriptionPlanFormValues = z.output<
  typeof createSubscriptionPlanFormSchema
>;

export const updateSubscriptionPlanFormSchema = z.object({
  name: z.string().trim().max(256).optional(),
  trialDays: optionalNonNegNumber(),
  isTrialEnabled: z.boolean().optional(),
  maxWorkspaces: optionalNonNegNumber(),
  maxUsers: optionalNonNegNumber(),
  maxFileAssets: optionalNonNegNumber(),
  maxStorageMb: optionalNonNegNumber(),
});

export type UpdateSubscriptionPlanFormValues = z.output<
  typeof updateSubscriptionPlanFormSchema
>;
