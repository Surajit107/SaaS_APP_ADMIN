import { createAction } from '@reduxjs/toolkit';
import { all, call, put, select, takeLatest } from 'redux-saga/effects';
import { toast } from 'sonner';

import {
  DELETE_PLATFORM_TENANT,
  GET_PLATFORM_ANALYTICS,
  GET_PLATFORM_OVERVIEW,
  GET_PLATFORM_SUBSCRIPTION_BY_TENANT,
  GET_PLATFORM_SUBSCRIPTION_PLAN_ADMIN,
  GET_PLATFORM_TENANTS,
  PATCH_PLATFORM_TENANT,
  type UpdateTenantPayload,
} from '@/lib/api/Api';
import { getApiErrorMessage } from '@/lib/api/errorMessage';
import type { TenantListBillingSummary, TenantProfile } from '@/lib/api/types';
import type { RootState } from '@/store/store';
import {
  platformAnalyticsFetchFailed,
  platformAnalyticsFetchRequested,
  platformAnalyticsFetchSucceeded,
} from '@/features/platform/slice/platformAnalyticsSlice';
import {
  platformOverviewFetchFailed,
  platformOverviewFetchRequested,
  platformOverviewFetchSucceeded,
} from '@/features/platform/slice/platformOverviewSlice';
import {
  planForEditFetchFailed,
  planForEditFetchStarted,
  planForEditFetchSucceeded,
} from '@/features/platform/slice/platformSubscriptionPlansSlice';
import {
  platformTenantMutationFailed,
  platformTenantMutationFinished,
  platformTenantMutationStarted,
  platformTenantsListFetchFailed,
  platformTenantsListFetchRequested,
  platformTenantsListFetchSucceeded,
  platformTenantsListParamsUpdated,
  type PlatformTenantsListParams,
} from '@/features/platform/slice/platformTenantsSlice';

const PLATFORM_TENANT_LIST_MAX_LIMIT = 100;
const PLATFORM_TENANT_LIST_DEFAULT_LIMIT = 20;

function resolvePlatformTenantListLimit(requested: number | undefined): number {
  if (requested === undefined) {
    return PLATFORM_TENANT_LIST_DEFAULT_LIMIT;
  }
  const n = Math.floor(requested);
  if (!Number.isFinite(n)) {
    return PLATFORM_TENANT_LIST_DEFAULT_LIMIT;
  }
  return Math.min(PLATFORM_TENANT_LIST_MAX_LIMIT, Math.max(1, n));
}

/** Matches `PlatformSubscriptionMonitoringService.getByTenantId` when no Mongo row exists. */
const NO_SUBSCRIPTION_ROW_MESSAGE = 'No billing record for tenant yet' as const;

/**
 * Older backends omit `subscription` on list rows. Merge per-tenant snapshots from
 * `GET /platform/subscriptions/:tenantId` so billing pills work without redeploying API.
 */
async function enrichTenantRowsWithSubscriptionSummaries(
  items: TenantProfile[],
): Promise<TenantProfile[]> {
  if (!items.some((row) => row.subscription === undefined)) {
    return items;
  }
  return Promise.all(
    items.map(async (row) => {
      if (row.subscription !== undefined) {
        return row;
      }
      try {
        const res = await GET_PLATFORM_SUBSCRIPTION_BY_TENANT(row.id);
        const body = res.data;
        const subscription: TenantListBillingSummary | null =
          body.message === NO_SUBSCRIPTION_ROW_MESSAGE
            ? null
            : {
                status: body.data.status,
                planKey: body.data.planKey ?? '',
              };
        return { ...row, subscription };
      } catch {
        return { ...row, subscription: null };
      }
    }),
  );
}

export const platformOverviewSyncRequested = createAction('platform/overviewSyncRequested');

export const platformAnalyticsSyncRequested = createAction<{
  days?: number;
}>('platform/analyticsSyncRequested');

export const platformTenantsListSyncFlowRequested = createAction<{
  search?: string;
  includeDeleted?: boolean;
  activeFilter?: PlatformTenantsListParams['activeFilter'];
  page?: number;
  limit?: number;
}>('platform/tenantsListSyncFlowRequested');

export const platformTenantUpdateFlowRequested = createAction<{
  tenantId: string;
  payload: UpdateTenantPayload;
}>('platform/tenantUpdateFlowRequested');

export const platformTenantDeleteFlowRequested = createAction<{
  tenantId: string;
}>('platform/tenantDeleteFlowRequested');

/** Loads one catalog row for the edit sheet (GET /platform/subscription-plans/admin/:planId). */
export const platformAdminPlanForEditFetchRequested = createAction<{
  planId: string;
}>('platform/adminPlanForEditFetchRequested');

function* handlePlatformOverviewSync(): Generator {
  try {
    yield put(platformOverviewFetchRequested());
    const response = (yield call(
      GET_PLATFORM_OVERVIEW,
    )) as Awaited<ReturnType<typeof GET_PLATFORM_OVERVIEW>>;
    yield put(platformOverviewFetchSucceeded(response.data.data));
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, 'Unable to load platform overview');
    toast.error(message);
    yield put(platformOverviewFetchFailed(message));
  }
}

function* handlePlatformAnalyticsSync(
  action: ReturnType<typeof platformAnalyticsSyncRequested>,
): Generator {
  try {
    yield put(platformAnalyticsFetchRequested());
    const payload = action.payload as { days?: number };
    const currentDays = (yield select(
      (s: RootState) => s.platformAnalytics.days,
    )) as number;
    const days = payload.days ?? currentDays;
    const response = (yield call(GET_PLATFORM_ANALYTICS, {
      days,
    })) as Awaited<ReturnType<typeof GET_PLATFORM_ANALYTICS>>;
    yield put(platformAnalyticsFetchSucceeded(response.data.data));
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, 'Unable to load analytics');
    toast.error(message);
    yield put(platformAnalyticsFetchFailed(message));
  }
}

function* handlePlatformTenantsListSyncFlow(
  action: ReturnType<typeof platformTenantsListSyncFlowRequested>,
): Generator {
  try {
    const patch = action.payload as Partial<PlatformTenantsListParams>;
    const previous = (yield select(
      (state: RootState) => state.platformTenants.params,
    )) as RootState['platformTenants']['params'];

    const next: PlatformTenantsListParams = {
      search: patch.search !== undefined ? patch.search : previous.search,
      includeDeleted:
        patch.includeDeleted !== undefined ? patch.includeDeleted : previous.includeDeleted,
      activeFilter:
        patch.activeFilter !== undefined ? patch.activeFilter : previous.activeFilter,
      page: patch.page !== undefined ? patch.page : previous.page,
      limit:
        patch.limit !== undefined
          ? resolvePlatformTenantListLimit(patch.limit)
          : previous.limit,
    };

    yield put(platformTenantsListParamsUpdated(next));
    yield put(platformTenantsListFetchRequested());

    const trimmed = next.search.trim();
    const isActive =
      next.activeFilter === 'all'
        ? undefined
        : next.activeFilter === 'active';

    const response = (yield call(GET_PLATFORM_TENANTS, {
      page: next.page,
      limit: next.limit,
      search: trimmed.length > 0 ? trimmed : undefined,
      includeDeleted: next.includeDeleted,
      isActive,
    })) as Awaited<ReturnType<typeof GET_PLATFORM_TENANTS>>;

    const listData = response.data.data;
    const mergedItems = (yield call(
      enrichTenantRowsWithSubscriptionSummaries,
      listData.items,
    )) as TenantProfile[];

    yield put(
      platformTenantsListFetchSucceeded({
        ...listData,
        items: mergedItems,
      }),
    );
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, 'Unable to load tenants');
    toast.error(message);
    yield put(platformTenantsListFetchFailed(message));
  }
}

function* handlePlatformTenantUpdateFlow(
  action: ReturnType<typeof platformTenantUpdateFlowRequested>,
): Generator {
  try {
    yield put(platformTenantMutationStarted());
    yield call(
      PATCH_PLATFORM_TENANT,
      action.payload.tenantId,
      action.payload.payload,
    );
    toast.success('Organization updated');
    yield put(platformTenantMutationFinished());
    yield put(platformTenantsListSyncFlowRequested({}));
    yield put(platformOverviewSyncRequested());
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, 'Unable to update organization');
    toast.error(message);
    yield put(platformTenantMutationFailed(message));
  }
}

function* handlePlatformAdminPlanForEditFetch(
  action: ReturnType<typeof platformAdminPlanForEditFetchRequested>,
): Generator {
  const raw = action.payload.planId.trim();
  if (raw.length === 0) {
    return;
  }
  try {
    yield put(planForEditFetchStarted({ planId: raw }));
    const response = (yield call(
      GET_PLATFORM_SUBSCRIPTION_PLAN_ADMIN,
      raw,
    )) as Awaited<ReturnType<typeof GET_PLATFORM_SUBSCRIPTION_PLAN_ADMIN>>;
    yield put(planForEditFetchSucceeded(response.data.data));
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, 'Unable to load plan for editing');
    toast.error(message);
    yield put(planForEditFetchFailed(message));
  }
}

function* handlePlatformTenantDeleteFlow(
  action: ReturnType<typeof platformTenantDeleteFlowRequested>,
): Generator {
  try {
    yield put(platformTenantMutationStarted());
    yield call(DELETE_PLATFORM_TENANT, action.payload.tenantId);
    toast.success('Organization scheduled for removal (TTL purge)');
    yield put(platformTenantMutationFinished());
    yield put(platformTenantsListSyncFlowRequested({}));
    yield put(platformOverviewSyncRequested());
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, 'Unable to delete organization');
    toast.error(message);
    yield put(platformTenantMutationFailed(message));
  }
}

export function* platformSaga(): Generator {
  yield all([
    takeLatest(platformOverviewSyncRequested.type, handlePlatformOverviewSync),
    takeLatest(platformAnalyticsSyncRequested.type, handlePlatformAnalyticsSync),
    takeLatest(platformTenantsListSyncFlowRequested.type, handlePlatformTenantsListSyncFlow),
    takeLatest(platformTenantUpdateFlowRequested.type, handlePlatformTenantUpdateFlow),
    takeLatest(platformTenantDeleteFlowRequested.type, handlePlatformTenantDeleteFlow),
    takeLatest(
      platformAdminPlanForEditFetchRequested.type,
      handlePlatformAdminPlanForEditFetch,
    ),
  ]);
}
