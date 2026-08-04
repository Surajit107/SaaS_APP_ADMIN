/**
 * Mirrors backend `{ success: true; message; data }` envelopes from Nest controllers.
 */

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  data: null;
  path: string;
}

/** JWT user summary from `/auth/login` | `/auth/refresh`. */
export interface AuthSessionUser {
  id: string;
  email: string;
  tenantId: string;
  platformAdmin: boolean;
  tenantRole?: 'admin' | 'member';
  displayName?: string;
}

/** Session payload nested under `data` for auth mutations. */
export interface AuthSessionData {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: AuthSessionUser;
}

export type AuthTokens = Pick<AuthSessionData, 'accessToken' | 'refreshToken'>;

/** `/auth/register` — account created; verify email then `/auth/login` (no tokens here). */
export interface RegisterSuccessData {
  email: string;
  tenantId: string;
  organizationName: string;
  emailVerificationSent: boolean;
}

export type VerifyEmailResponse = ApiSuccessResponse<{ email: string }>;

export type RegisterResponse = ApiSuccessResponse<RegisterSuccessData>;
export type LoginResponse = ApiSuccessResponse<AuthSessionData>;
export type RefreshTokenResponse = ApiSuccessResponse<AuthSessionData>;
export type LogoutResponse = ApiSuccessResponse<null>;

export interface AuthHealthData {
  module: string;
  dbReady: boolean;
}

/** `/auth/me` — tenant-scoped (requires JWT + tenant guard). */
export type GetMeResponse = ApiSuccessResponse<AuthSessionUser>;

export interface BillingPlan {
  id: string;
  name: string;
  stripePriceId: string;
  amount: number;
  currency: string;
  interval: string;
  trialDays: number;
  isTrialEnabled: boolean;
  features: {
    maxWorkspaces?: number;
    maxUsers?: number;
    maxFileAssets?: number;
    maxStorageMb?: number;
    aiChatbot?: boolean;
  } | null;
  entitlements: {
    aiChatbot: boolean;
  };
  featureHighlights: string[];
  createdAt: string;
  updatedAt: string;
}

/** Billing summary joined on GET /platform/tenants only; `null` = no Mongo subscription row. */
export interface TenantListBillingSummary {
  status: string;
  planKey: string;
}

export interface TenantProfile {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  purgeAt: string | null;
  subscription?: TenantListBillingSummary | null;
}

export interface TenantSubscriptionSnapshot {
  tenantId: string;
  status: string;
  planKey: string;
  stripePriceId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  nextBillingDate?: string;
  nextBillingInDays?: number;
  plan: {
    id: string;
    name: string;
    stripePriceId: string;
    amount: number;
    currency: string;
    interval: string;
    trialDays: number;
    isTrialEnabled: boolean;
    features: BillingPlan['features'];
    entitlements: BillingPlan['entitlements'];
    featureHighlights: string[];
    createdAt: string;
    updatedAt: string;
  } | null;
}

export interface CheckoutSessionData {
  sessionId: string;
  url: string | null;
}

export interface CheckoutSuccessSyncData {
  sessionId: string;
  synced: boolean;
  subscriptionStatus: string;
  planKey: string;
  cancelAtPeriodEnd: boolean;
}

export interface CancelSubscriptionData {
  canceledNow: boolean;
  status: string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string;
  currentPeriodEnd?: string;
}

export interface RefundRequestData {
  refundId: string;
  status: string | null;
  chargeId: string;
  amount: number;
  currency: string;
}

/** POST /tenant/users/accept-invite — account activation success. */
export interface AcceptInviteData {
  message: string;
}
export type AcceptInviteResponse = ApiSuccessResponse<AcceptInviteData>;

/** GET /tenant/users — one row in the paginated list. */
export interface TenantUserProfile {
  id: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'member';
  isActive: boolean;
  isEmailVerified: boolean;
  tenantId: string;
  createdAt?: string;
}

export interface PaginatedTenantUsersData {
  users: TenantUserProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type TenantUserListResponse = ApiSuccessResponse<PaginatedTenantUsersData>;

export type TenantMePatchResponse = ApiSuccessResponse<TenantUserProfile>;

export type TenantUserDetailResponse = ApiSuccessResponse<TenantUserProfile>;
export type InviteTenantUserResponse = ApiSuccessResponse<TenantUserProfile>;
export type UpdateTenantUserResponse = ApiSuccessResponse<TenantUserProfile>;
export type DeleteTenantUserResponse = ApiSuccessResponse<null>;

export type BillingPlansResponse = ApiSuccessResponse<BillingPlan[]>;
export type BillingPlanResponse = ApiSuccessResponse<BillingPlan>;
export type TenantProfileResponse = ApiSuccessResponse<TenantProfile>;
export type TenantSubscriptionResponse = ApiSuccessResponse<TenantSubscriptionSnapshot>;
export type CheckoutSessionResponse = ApiSuccessResponse<CheckoutSessionData>;
export type CheckoutSuccessSyncResponse = ApiSuccessResponse<CheckoutSuccessSyncData>;
export type CancelSubscriptionResponse = ApiSuccessResponse<CancelSubscriptionData>;
export type RefundRequestResponse = ApiSuccessResponse<RefundRequestData>;

export const TASK_STATUS_VALUES = [
  'TODO',
  'IN_PROGRESS',
  'BLOCKED',
  'DONE',
] as const;
export type TaskStatus = (typeof TASK_STATUS_VALUES)[number];

export type WorkspaceTaskStatusCounts = Record<TaskStatus, number>;

export interface WorkspaceTask {
  id: string;
  workspaceId: string;
  tenantId: string;
  title: string;
  description: string | null;
  attachmentUrls: string[];
  status: TaskStatus;
  assignedTo: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceTaskListData {
  items: WorkspaceTask[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  statusCounts: WorkspaceTaskStatusCounts;
}

export interface WorkspaceTaskDeleteData {
  taskId: string;
  deleted: true;
}

export type WorkspaceTaskListResponse = ApiSuccessResponse<WorkspaceTaskListData>;
export type WorkspaceTaskResponse = ApiSuccessResponse<WorkspaceTask>;
export type WorkspaceTaskDeleteResponse = ApiSuccessResponse<WorkspaceTaskDeleteData>;

export interface CreateUploadSignatureData {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  resourceType: string;
  allowedFormats: string[];
  expiresAt: string;
}

export interface RegisteredFileAssetData {
  publicId: string;
  secureUrl: string;
  resourceType: string;
  format?: string;
  bytes?: number;
  mimeType: string;
  uploadStage: 'TEMPORARY' | 'FINALIZED';
  expiresAt?: string;
}

export interface FileAssetDeleteData {
  publicId: string;
  deleted: boolean;
}

export type CreateUploadSignatureResponse = ApiSuccessResponse<CreateUploadSignatureData>;
export type RegisterFileAssetResponse = ApiSuccessResponse<RegisteredFileAssetData>;
export type FileAssetDeleteResponse = ApiSuccessResponse<FileAssetDeleteData>;

export interface InAppNotificationItem {
  id: string;
  type: string;
  title: string;
  body?: string;
  status: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type InAppNotificationListResponse = ApiSuccessResponse<InAppNotificationItem[]>;

export interface InAppNotificationMarkReadData {
  id: string;
  status: string;
}

export type InAppNotificationMarkReadResponse =
  ApiSuccessResponse<InAppNotificationMarkReadData>;

export interface Workspace {
  id: string;
  tenantId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceDeleteData {
  workspaceId: string;
  deleted: true;
}

export type WorkspaceListResponse = ApiSuccessResponse<Workspace[]>;
export type WorkspaceResponse = ApiSuccessResponse<Workspace>;
export type WorkspaceDeleteResponse = ApiSuccessResponse<WorkspaceDeleteData>;

/** GET /platform/overview */
export interface PlatformOverviewData {
  tenantsActive: number;
  tenantsPendingPurge: number;
  userCount: number;
}

export type PlatformOverviewResponse = ApiSuccessResponse<PlatformOverviewData>;

/** GET /platform/tenants — paginated; `items` match `TenantProfile` (public tenant row). */
export interface PlatformTenantListData {
  items: TenantProfile[];
  total: number;
  page: number;
  limit: number;
}

export type PlatformTenantListResponse = ApiSuccessResponse<PlatformTenantListData>;

export interface PlatformTenantSoftDeleteData {
  id: string;
  deletedAt: string;
  purgeAt: string;
}

export type PlatformTenantSoftDeleteResponse =
  ApiSuccessResponse<PlatformTenantSoftDeleteData>;

/** GET /platform/subscriptions — one billing row (Mongo + Stripe ids). */
export interface PlatformSubscriptionRow {
  tenantId: string;
  tenantName: string | null;
  tenantIsActive: boolean | null;
  status: string;
  planKey: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformSubscriptionListData {
  items: PlatformSubscriptionRow[];
  total: number;
  page: number;
  limit: number;
}

export type PlatformSubscriptionListResponse =
  ApiSuccessResponse<PlatformSubscriptionListData>;

export type PlatformSubscriptionDetailResponse =
  ApiSuccessResponse<PlatformSubscriptionRow>;

/** GET /platform/subscription-plans/admin — catalog row (platform operator). */
export interface PlatformSubscriptionPlanCatalogRow {
  id: string;
  name: string;
  stripePriceId: string;
  stripeProductId?: string;
  amount: number;
  currency: string;
  interval: string;
  trialDays: number;
  isTrialEnabled: boolean;
  features?: {
    maxWorkspaces?: number;
    maxUsers?: number;
    maxFileAssets?: number;
    maxStorageMb?: number;
    aiChatbot?: boolean;
  } | null;
  entitlements: {
    aiChatbot: boolean;
  };
  featureHighlights: string[];
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export type PlatformSubscriptionPlansAdminResponse =
  ApiSuccessResponse<PlatformSubscriptionPlanCatalogRow[]>;
export type PlatformSubscriptionPlanDetailResponse =
  ApiSuccessResponse<PlatformSubscriptionPlanCatalogRow>;

export type CreateSubscriptionPlanResponse =
  ApiSuccessResponse<PlatformSubscriptionPlanCatalogRow>;

export type UpdateSubscriptionPlanResponse =
  ApiSuccessResponse<PlatformSubscriptionPlanCatalogRow>;

export type ArchiveSubscriptionPlanResponse =
  ApiSuccessResponse<PlatformSubscriptionPlanCatalogRow>;

/** GET /platform/analytics — per-day tenant growth point. */
export interface PlatformAnalyticsTenantGrowthBucket {
  date: string;
  newTenants: number;
  cumulativeTenants: number;
}

/** GET /platform/analytics — current subscription status histogram slice. */
export interface PlatformAnalyticsSubscriptionStatusSlice {
  status: string;
  count: number;
}

/** GET /platform/analytics — plan distribution row (active + trialing only). */
export interface PlatformAnalyticsPlanDistributionRow {
  planId: string | null;
  planName: string;
  currency: string;
  subscribers: number;
  monthlyRevenue: number;
}

/** GET /platform/analytics — per-day new MRR added bucket. */
export interface PlatformAnalyticsNewMrrBucket {
  date: string;
  newMrr: number;
  newSubscriptions: number;
}

/** GET /platform/analytics — per-currency MRR / ARR roll-up. */
export interface PlatformAnalyticsRevenueRow {
  currency: string;
  mrr: number;
  arr: number;
  subscribers: number;
}

/** GET /platform/analytics — top-level KPIs. */
export interface PlatformAnalyticsTotals {
  tenantsActive: number;
  tenantsPendingPurge: number;
  tenantsDeleted: number;
  userCount: number;
  subscriptionsActive: number;
  subscriptionsAtRisk: number;
  subscriptionsCanceled: number;
  revenue: PlatformAnalyticsRevenueRow[];
  dominantCurrency: string | null;
}

export interface PlatformAnalyticsData {
  range: { days: number; from: string; to: string };
  totals: PlatformAnalyticsTotals;
  tenantGrowth: PlatformAnalyticsTenantGrowthBucket[];
  subscriptionStatus: PlatformAnalyticsSubscriptionStatusSlice[];
  planDistribution: PlatformAnalyticsPlanDistributionRow[];
  newMrrByDay: PlatformAnalyticsNewMrrBucket[];
}

export type PlatformAnalyticsResponse =
  ApiSuccessResponse<PlatformAnalyticsData>;

export interface PlatformAnalyticsQuery {
  days?: number;
}

export type PlatformAiChatbotStatusResponse = ApiSuccessResponse<{
  openrouterKeyConfigured: boolean;
  groqKeyConfigured: boolean;
  geminiKeyConfigured: boolean;
  providerOrder: string;
  modelOpenrouter: string;
  modelGroq: string;
  modelGemini: string;
  systemPromptConfigured: boolean;
}>;
