/** Outbound HTTP request body shapes */

import type { TaskStatus } from './responses';

export interface RegisterPayload {
  organizationName: string;
  displayName: string;
  email: string;
  password: string;
}

/** POST /tenant/users/accept-invite — public endpoint to activate an invited account. */
export interface AcceptInvitePayload {
  email: string;
  token: string;
  password: string;
}

export type AuthLoginScope = 'tenant' | 'platform';

/** Which tenant sign-in page is calling the API; must match the user’s org role. */
export type TenantLoginPortalRole = 'admin' | 'member';

export interface LoginPayload {
  email: string;
  password: string;
  authScope: AuthLoginScope;
  tenantRole?: TenantLoginPortalRole;
}

export interface VerifyEmailPayload {
  email: string;
  token: string;
}

export interface RefreshTokenPayload {
  refreshToken?: string;
}

export interface LogoutPayload {
  refreshToken?: string;
}

export interface CreateCheckoutSessionPayload {
  stripePriceId: string;
}

export interface ConfirmCheckoutSessionPayload {
  sessionId: string;
}

export interface CancelSubscriptionPayload {
  immediate?: boolean;
}

export interface RequestRefundPayload {
  note?: string;
}

/** PATCH /tenants/me — at least one field required by the server. */
export interface UpdateTenantPayload {
  name?: string;
  isActive?: boolean;
}

/** PATCH /tenant/me — self-service profile for the signed-in tenant user. */
export interface UpdateTenantMePayload {
  displayName: string;
}

export interface ListWorkspaceTasksQuery {
  status?: TaskStatus;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/** GET /tenant/users — query params (tenant admin). */
export interface ListTenantUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
}

/** POST /tenant/users — invite a user (tenant admin). */
export interface InviteTenantUserPayload {
  email: string;
  displayName?: string;
  role?: 'admin' | 'member';
}

/** PATCH /tenant/users/:userId — update a tenant user (tenant admin). */
export interface UpdateTenantUserPayload {
  displayName?: string;
  role?: 'admin' | 'member';
  isActive?: boolean;
}

export interface CreateWorkspaceTaskPayload {
  title: string;
  description?: string;
  attachmentUrls?: string[];
  tempAttachmentPublicIds?: string[];
  status?: TaskStatus;
  assignedTo?: string;
}

export interface UpdateWorkspaceTaskPayload {
  title?: string;
  description?: string | null;
  attachmentUrls?: string[];
  tempAttachmentPublicIds?: string[];
  status?: TaskStatus;
  assignedTo?: string | null;
}

export interface DeleteFileAssetPayload {
  publicId: string;
}

export type FileUploadResourceType = 'auto' | 'image' | 'video' | 'raw';

export interface CreateUploadSignaturePayload {
  fileName?: string;
  mimeType: string;
  resourceType?: FileUploadResourceType;
  intent?: 'WORKSPACE_TASK';
  taskId?: string;
}

export interface RegisterFileAssetPayload {
  publicId: string;
  secureUrl: string;
  resourceType: string;
  format?: string;
  bytes?: number;
  mimeType: string;
  taskId?: string;
}

export interface CreateWorkspacePayload {
  name: string;
}
