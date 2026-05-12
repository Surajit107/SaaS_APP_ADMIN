import type { AxiosResponse } from 'axios';

import { apiClient } from '@/lib/api/client';
import { setupInterceptors } from '@/lib/api/interceptor';
import type {
  AcceptInvitePayload,
  AcceptInviteResponse,
  BillingPlansResponse,
  BillingPlanResponse,
  CancelSubscriptionPayload,
  CancelSubscriptionResponse,
  CreateUploadSignaturePayload,
  CreateUploadSignatureResponse,
  CreateWorkspacePayload,
  CreateWorkspaceTaskPayload,
  DeleteFileAssetPayload,
  DeleteTenantUserResponse,
  CheckoutSuccessSyncResponse,
  CheckoutSessionResponse,
  ConfirmCheckoutSessionPayload,
  CreateCheckoutSessionPayload,
  FileAssetDeleteResponse,
  GetMeResponse,
  InviteTenantUserPayload,
  InviteTenantUserResponse,
  InAppNotificationListResponse,
  InAppNotificationMarkReadResponse,
  ListTenantUsersQuery,
  ListWorkspaceTasksQuery,
  LoginPayload,
  LoginResponse,
  PlatformAnalyticsQuery,
  PlatformAnalyticsResponse,
  PlatformOverviewResponse,
  ArchiveSubscriptionPlanResponse,
  CreateSubscriptionPlanPayload,
  CreateSubscriptionPlanResponse,
  PlatformSubscriptionDetailResponse,
  PlatformSubscriptionPlanDetailResponse,
  PlatformSubscriptionListQuery,
  PlatformSubscriptionListResponse,
  PlatformSubscriptionPlansAdminQuery,
  PlatformSubscriptionPlansAdminResponse,
  PlatformTenantListQuery,
  PlatformTenantListResponse,
  PlatformTenantSoftDeleteResponse,
  PlatformAiChatbotStatusResponse,
  UpdateSubscriptionPlanPayload,
  UpdateSubscriptionPlanResponse,
  LogoutPayload,
  LogoutResponse,
  RefreshTokenPayload,
  RefreshTokenResponse,
  RegisterFileAssetPayload,
  RegisterFileAssetResponse,
  RegisterPayload,
  RegisterResponse,
  VerifyEmailPayload,
  VerifyEmailResponse,
  RequestRefundPayload,
  RefundRequestResponse,
  TenantMePatchResponse,
  TenantUserDetailResponse,
  TenantProfileResponse,
  TenantSubscriptionResponse,
  UpdateTenantMePayload,
  UpdateTenantPayload,
  UpdateTenantUserPayload,
  UpdateTenantUserResponse,
  UpdateWorkspaceTaskPayload,
  WorkspaceDeleteResponse,
  WorkspaceListResponse,
  WorkspaceResponse,
  WorkspaceTaskDeleteResponse,
  TenantUserListResponse,
  WorkspaceTaskListResponse,
  WorkspaceTaskResponse,
} from '@/lib/api/types';
import { API_BASE_URL } from '@/lib/api/env';

export type {
  AcceptInvitePayload,
  AcceptInviteResponse,
  ApiSuccessResponse,
  AuthHealthData,
  AuthSessionData,
  AuthSessionUser,
  BillingPlan,
  BillingPlanResponse,
  BillingPlansResponse,
  CheckoutSuccessSyncData,
  CheckoutSuccessSyncResponse,
  CheckoutSessionData,
  CheckoutSessionResponse,
  ConfirmCheckoutSessionPayload,
  CreateCheckoutSessionPayload,
  CancelSubscriptionPayload,
  CancelSubscriptionResponse,
  AuthLoginScope,
  LoginPayload,
  LogoutPayload,
  LogoutResponse,
  LoginResponse,
  RefreshTokenPayload,
  RefreshTokenResponse,
  RequestRefundPayload,
  RefundRequestResponse,
  RegisterPayload,
  RegisterResponse,
  RegisterSuccessData,
  TenantLoginPortalRole,
  VerifyEmailPayload,
  VerifyEmailResponse,
  GetMeResponse,
  InAppNotificationItem,
  InAppNotificationListResponse,
  InAppNotificationMarkReadResponse,
  AuthTokens,
  CreateUploadSignatureData,
  CreateUploadSignaturePayload,
  CreateUploadSignatureResponse,
  TenantProfile,
  TenantProfileResponse,
  TenantSubscriptionResponse,
  TenantSubscriptionSnapshot,
  TaskStatus,
  WorkspaceTaskStatusCounts,
  RegisterFileAssetPayload,
  RegisteredFileAssetData,
  RegisterFileAssetResponse,
  FileAssetDeleteData,
  FileAssetDeleteResponse,
  DeleteFileAssetPayload,
  DeleteTenantUserResponse,
  InviteTenantUserPayload,
  InviteTenantUserResponse,
  PaginatedTenantUsersData,
  TenantMePatchResponse,
  TenantUserDetailResponse,
  TenantUserProfile,
  UpdateTenantMePayload,
  UpdateTenantUserPayload,
  UpdateTenantUserResponse,
  Workspace,
  WorkspaceDeleteData,
  WorkspaceDeleteResponse,
  WorkspaceListResponse,
  WorkspaceResponse,
  WorkspaceTask,
  WorkspaceTaskDeleteData,
  WorkspaceTaskDeleteResponse,
  WorkspaceTaskListData,
  WorkspaceTaskListResponse,
  WorkspaceTaskResponse,
  ListTenantUsersQuery,
  ListWorkspaceTasksQuery,
  CreateWorkspacePayload,
  CreateWorkspaceTaskPayload,
  UpdateTenantPayload,
  UpdateWorkspaceTaskPayload,
  PlatformAnalyticsData,
  PlatformAnalyticsNewMrrBucket,
  PlatformAnalyticsPlanDistributionRow,
  PlatformAnalyticsQuery,
  PlatformAnalyticsResponse,
  PlatformAnalyticsRevenueRow,
  PlatformAnalyticsSubscriptionStatusSlice,
  PlatformAnalyticsTenantGrowthBucket,
  PlatformAnalyticsTotals,
  PlatformOverviewData,
  PlatformOverviewResponse,
  PlatformTenantListData,
  PlatformTenantListQuery,
  PlatformTenantListResponse,
  PlatformTenantSoftDeleteData,
  PlatformTenantSoftDeleteResponse,
  PlatformSubscriptionListData,
  PlatformSubscriptionPlanDetailResponse,
  PlatformSubscriptionPlanCatalogRow,
  PlatformSubscriptionRow,
  PlatformSubscriptionPlansAdminQuery,
  PlatformAiChatbotStatusResponse,
} from '@/lib/api/types';

/** Shared axios instance (`api/client.ts`). Interceptors: token attach + queued refresh (`/auth/refresh`). */
export const API = apiClient;

setupInterceptors(API);

export { API_BASE_URL };
/** Legacy CRA-style alias for the same value */
export const REACT_APP_BASE_URL: string = API_BASE_URL;

export const ACCEPT_INVITE = (
  data: AcceptInvitePayload,
): Promise<AxiosResponse<AcceptInviteResponse>> =>
  API.post<AcceptInviteResponse>('/tenant/users/accept-invite', data);

export const REGISTER = (
  data: RegisterPayload,
): Promise<AxiosResponse<RegisterResponse>> =>
  API.post<RegisterResponse>('/auth/register', data);

export const VERIFY_EMAIL = (
  data: VerifyEmailPayload,
): Promise<AxiosResponse<VerifyEmailResponse>> =>
  API.post<VerifyEmailResponse>('/auth/verify-email', data);

export const LOGIN = (
  data: LoginPayload,
): Promise<AxiosResponse<LoginResponse>> =>
  API.post<LoginResponse>('/auth/login', data);

export const LOGOUT = (
  data: LogoutPayload = {},
): Promise<AxiosResponse<LogoutResponse>> =>
  API.post<LogoutResponse>('/auth/logout', data);

export const REFRESH_TOKEN = (
  data: RefreshTokenPayload = {},
): Promise<AxiosResponse<RefreshTokenResponse>> =>
  API.post<RefreshTokenResponse>('/auth/refresh', data);

export const GET_ME = (): Promise<AxiosResponse<GetMeResponse>> =>
  API.get<GetMeResponse>('/auth/me');

export const GET_IN_APP_NOTIFICATIONS = (
  limit = 30,
): Promise<AxiosResponse<InAppNotificationListResponse>> =>
  API.get<InAppNotificationListResponse>('/notifications/in-app', {
    params: { limit },
  });

export const MARK_IN_APP_NOTIFICATION_READ = (
  notificationId: string,
): Promise<AxiosResponse<InAppNotificationMarkReadResponse>> =>
  API.patch<InAppNotificationMarkReadResponse>(
    `/notifications/in-app/${encodeURIComponent(notificationId)}/read`,
  );

export const GET_BILLING_PLANS = (): Promise<AxiosResponse<BillingPlansResponse>> =>
  API.get<BillingPlansResponse>('/billing/plans');

export const GET_BILLING_PLAN_BY_ID = (
  planId: string,
): Promise<AxiosResponse<BillingPlanResponse>> =>
  API.get<BillingPlanResponse>(`/billing/plans/${encodeURIComponent(planId)}`);

export const GET_TENANT_SUBSCRIPTION = (): Promise<
  AxiosResponse<TenantSubscriptionResponse>
> => API.get<TenantSubscriptionResponse>('/billing/subscription');

export const GET_TENANT_ME = (): Promise<AxiosResponse<TenantProfileResponse>> =>
  API.get<TenantProfileResponse>('/tenants/me');

export const PATCH_TENANT_ME = (
  data: UpdateTenantPayload,
): Promise<AxiosResponse<TenantProfileResponse>> =>
  API.patch<TenantProfileResponse>('/tenants/me', data);

export const PATCH_TENANT_USER_ME = (
  data: UpdateTenantMePayload,
): Promise<AxiosResponse<TenantMePatchResponse>> =>
  API.patch<TenantMePatchResponse>('/tenant/me', data);

export const GET_TENANT_USERS = (
  query: ListTenantUsersQuery = {},
): Promise<AxiosResponse<TenantUserListResponse>> =>
  API.get<TenantUserListResponse>('/tenant/users', {
    params: query,
  });

export const INVITE_TENANT_USER = (
  data: InviteTenantUserPayload,
): Promise<AxiosResponse<InviteTenantUserResponse>> =>
  API.post<InviteTenantUserResponse>('/tenant/users', data);

export const GET_TENANT_USER_BY_ID = (
  userId: string,
): Promise<AxiosResponse<TenantUserDetailResponse>> =>
  API.get<TenantUserDetailResponse>(
    `/tenant/users/${encodeURIComponent(userId)}`,
  );

export const PATCH_TENANT_USER = (
  userId: string,
  data: UpdateTenantUserPayload,
): Promise<AxiosResponse<UpdateTenantUserResponse>> =>
  API.patch<UpdateTenantUserResponse>(
    `/tenant/users/${encodeURIComponent(userId)}`,
    data,
  );

export const DELETE_TENANT_USER = (
  userId: string,
): Promise<AxiosResponse<DeleteTenantUserResponse>> =>
  API.delete<DeleteTenantUserResponse>(
    `/tenant/users/${encodeURIComponent(userId)}`,
  );

export const CREATE_CHECKOUT_SESSION = (
  data: CreateCheckoutSessionPayload,
): Promise<AxiosResponse<CheckoutSessionResponse>> =>
  API.post<CheckoutSessionResponse>('/billing/checkout-session', data);

export const CONFIRM_CHECKOUT_SUCCESS = (
  data: ConfirmCheckoutSessionPayload,
): Promise<AxiosResponse<CheckoutSuccessSyncResponse>> =>
  API.post<CheckoutSuccessSyncResponse>('/billing/checkout-success', data);

export const CANCEL_TENANT_SUBSCRIPTION = (
  data: CancelSubscriptionPayload = {},
): Promise<AxiosResponse<CancelSubscriptionResponse>> =>
  API.post<CancelSubscriptionResponse>('/billing/subscription/cancel', data);

export const REQUEST_TENANT_SUBSCRIPTION_REFUND = (
  data: RequestRefundPayload = {},
): Promise<AxiosResponse<RefundRequestResponse>> =>
  API.post<RefundRequestResponse>('/billing/subscription/refund', data);

export const GET_WORKSPACE_TASKS = (
  workspaceId: string,
  query: ListWorkspaceTasksQuery = {},
): Promise<AxiosResponse<WorkspaceTaskListResponse>> =>
  API.get<WorkspaceTaskListResponse>(
    `/workspaces/${encodeURIComponent(workspaceId)}/tasks`,
    { params: query },
  );

/** GET /workspaces/me/tasks — tasks assigned to the signed-in user across all workspaces. */
export const GET_MY_TASKS = (
  query: Omit<ListWorkspaceTasksQuery, 'assignedTo'> = {},
): Promise<AxiosResponse<WorkspaceTaskListResponse>> =>
  API.get<WorkspaceTaskListResponse>('/workspaces/me/tasks', { params: query });

export const GET_WORKSPACE_TASK_DETAILS = (
  workspaceId: string,
  taskId: string,
): Promise<AxiosResponse<WorkspaceTaskResponse>> =>
  API.get<WorkspaceTaskResponse>(
    `/workspaces/${encodeURIComponent(workspaceId)}/tasks/${encodeURIComponent(taskId)}`,
  );

export const CREATE_WORKSPACE_TASK = (
  workspaceId: string,
  data: CreateWorkspaceTaskPayload,
): Promise<AxiosResponse<WorkspaceTaskResponse>> =>
  API.post<WorkspaceTaskResponse>(
    `/workspaces/${encodeURIComponent(workspaceId)}/tasks`,
    data,
  );

export const UPDATE_WORKSPACE_TASK = (
  workspaceId: string,
  taskId: string,
  data: UpdateWorkspaceTaskPayload,
): Promise<AxiosResponse<WorkspaceTaskResponse>> =>
  API.patch<WorkspaceTaskResponse>(
    `/workspaces/${encodeURIComponent(workspaceId)}/tasks/${encodeURIComponent(taskId)}`,
    data,
  );

export const DELETE_WORKSPACE_TASK = (
  workspaceId: string,
  taskId: string,
): Promise<AxiosResponse<WorkspaceTaskDeleteResponse>> =>
  API.delete<WorkspaceTaskDeleteResponse>(
    `/workspaces/${encodeURIComponent(workspaceId)}/tasks/${encodeURIComponent(taskId)}`,
  );

export const CREATE_UPLOAD_SIGNATURE = (
  data: CreateUploadSignaturePayload,
): Promise<AxiosResponse<CreateUploadSignatureResponse>> =>
  API.post<CreateUploadSignatureResponse>('/files/upload-signature', data);

export const REGISTER_FILE_ASSET = (
  data: RegisterFileAssetPayload,
): Promise<AxiosResponse<RegisterFileAssetResponse>> =>
  API.post<RegisterFileAssetResponse>('/files/assets', data);

export const DELETE_FILE_ASSET = (
  data: DeleteFileAssetPayload,
): Promise<AxiosResponse<FileAssetDeleteResponse>> =>
  API.delete<FileAssetDeleteResponse>('/files/assets', {
    data,
  });

export const GET_WORKSPACES = (): Promise<AxiosResponse<WorkspaceListResponse>> =>
  API.get<WorkspaceListResponse>('/workspaces');

export const CREATE_WORKSPACE = (
  data: CreateWorkspacePayload,
): Promise<AxiosResponse<WorkspaceResponse>> =>
  API.post<WorkspaceResponse>('/workspaces', data);

export const DELETE_WORKSPACE = (
  workspaceId: string,
): Promise<AxiosResponse<WorkspaceDeleteResponse>> =>
  API.delete<WorkspaceDeleteResponse>(
    `/workspaces/${encodeURIComponent(workspaceId)}`,
  );

/** GET /platform/overview — platform admin only. */
export const GET_PLATFORM_OVERVIEW = (): Promise<
  AxiosResponse<PlatformOverviewResponse>
> => API.get<PlatformOverviewResponse>('/platform/overview');

/**
 * GET /platform/analytics — live aggregated metrics for graphing
 * (tenant growth, status mix, plan distribution, MRR/ARR). `days` clamps the
 * time-series window (1..180; default 30).
 */
export const GET_PLATFORM_ANALYTICS = (
  query: PlatformAnalyticsQuery = {},
): Promise<AxiosResponse<PlatformAnalyticsResponse>> =>
  API.get<PlatformAnalyticsResponse>('/platform/analytics', { params: query });

/** GET /platform/tenants — paginated cross-tenant list. */
export const GET_PLATFORM_TENANTS = (
  query: PlatformTenantListQuery = {},
): Promise<AxiosResponse<PlatformTenantListResponse>> =>
  API.get<PlatformTenantListResponse>('/platform/tenants', { params: query });

/** GET /platform/tenants/:tenantId */
export const GET_PLATFORM_TENANT = (
  tenantId: string,
): Promise<AxiosResponse<TenantProfileResponse>> =>
  API.get<TenantProfileResponse>(
    `/platform/tenants/${encodeURIComponent(tenantId)}`,
  );

/** PATCH /platform/tenants/:tenantId — name / isActive (active orgs only). */
export const PATCH_PLATFORM_TENANT = (
  tenantId: string,
  data: UpdateTenantPayload,
): Promise<AxiosResponse<TenantProfileResponse>> =>
  API.patch<TenantProfileResponse>(
    `/platform/tenants/${encodeURIComponent(tenantId)}`,
    data,
  );

/** DELETE /platform/tenants/:tenantId — soft-delete (TTL purge). */
export const DELETE_PLATFORM_TENANT = (
  tenantId: string,
): Promise<AxiosResponse<PlatformTenantSoftDeleteResponse>> =>
  API.delete<PlatformTenantSoftDeleteResponse>(
    `/platform/tenants/${encodeURIComponent(tenantId)}`,
  );

/** GET /platform/subscriptions — paginated billing rows (Stripe webhook–synced Mongo state). */
export const GET_PLATFORM_SUBSCRIPTIONS = (
  query: PlatformSubscriptionListQuery = {},
): Promise<AxiosResponse<PlatformSubscriptionListResponse>> =>
  API.get<PlatformSubscriptionListResponse>('/platform/subscriptions', { params: query });

/** GET /platform/subscriptions/:tenantId — one organization billing snapshot. */
export const GET_PLATFORM_SUBSCRIPTION_BY_TENANT = (
  tenantId: string,
): Promise<AxiosResponse<PlatformSubscriptionDetailResponse>> =>
  API.get<PlatformSubscriptionDetailResponse>(
    `/platform/subscriptions/${encodeURIComponent(tenantId)}`,
  );

/** GET /platform/subscription-plans/admin — catalog (platform admin). Pass `includeArchived: false` to hide archived rows. */
export const GET_PLATFORM_SUBSCRIPTION_PLANS_ADMIN = (
  query: PlatformSubscriptionPlansAdminQuery = {},
): Promise<AxiosResponse<PlatformSubscriptionPlansAdminResponse>> =>
  API.get<PlatformSubscriptionPlansAdminResponse>('/platform/subscription-plans/admin', {
    params:
      query.includeArchived === undefined
        ? {}
        : { includeArchived: query.includeArchived ? 1 : 0 },
  });

/** GET /platform/subscription-plans/admin/:planId — full catalog detail (platform admin). */
export const GET_PLATFORM_SUBSCRIPTION_PLAN_ADMIN = (
  planId: string,
): Promise<AxiosResponse<PlatformSubscriptionPlanDetailResponse>> =>
  API.get<PlatformSubscriptionPlanDetailResponse>(
    `/platform/subscription-plans/admin/${encodeURIComponent(planId)}`,
  );

/** POST /platform/subscription-plans — create Stripe product/price + Mongo catalog row. */
export const POST_PLATFORM_SUBSCRIPTION_PLAN = (
  data: CreateSubscriptionPlanPayload,
): Promise<AxiosResponse<CreateSubscriptionPlanResponse>> =>
  API.post<CreateSubscriptionPlanResponse>('/platform/subscription-plans', data);

/** PATCH /platform/subscription-plans/:planId — metadata only (not price/interval). */
export const PATCH_PLATFORM_SUBSCRIPTION_PLAN = (
  planId: string,
  data: UpdateSubscriptionPlanPayload,
): Promise<AxiosResponse<UpdateSubscriptionPlanResponse>> =>
  API.patch<UpdateSubscriptionPlanResponse>(
    `/platform/subscription-plans/${encodeURIComponent(planId)}`,
    data,
  );

/** DELETE /platform/subscription-plans/:planId — archive (deactivate Stripe + catalog). */
export const DELETE_PLATFORM_SUBSCRIPTION_PLAN = (
  planId: string,
): Promise<AxiosResponse<ArchiveSubscriptionPlanResponse>> =>
  API.delete<ArchiveSubscriptionPlanResponse>(
    `/platform/subscription-plans/${encodeURIComponent(planId)}`,
  );

/** GET /platform/ai-chatbot/status — integration status (no secrets). */
export const GET_PLATFORM_AI_CHATBOT_STATUS = (): Promise<
  AxiosResponse<PlatformAiChatbotStatusResponse>
> => API.get<PlatformAiChatbotStatusResponse>('/platform/ai-chatbot/status');
