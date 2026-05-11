import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { logout } from '@/features/admin/slice/adminAuthSlice';
import type { PlatformTenantListData, TenantProfile } from '@/lib/api/types';

export type PlatformTenantActiveFilter = 'all' | 'active' | 'inactive';

export interface PlatformTenantsListParams {
  search: string;
  includeDeleted: boolean;
  activeFilter: PlatformTenantActiveFilter;
  page: number;
  limit: number;
}

export interface PlatformTenantsState {
  items: TenantProfile[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
  isMutationPending: boolean;
  mutationError: string | null;
  params: PlatformTenantsListParams;
}

const initialState: PlatformTenantsState = {
  items: [],
  total: 0,
  page: 1,
  limit: 20,
  isLoading: false,
  error: null,
  isMutationPending: false,
  mutationError: null,
  params: {
    search: '',
    includeDeleted: false,
    activeFilter: 'all',
    page: 1,
    limit: 20,
  },
};

export const platformTenantsSlice = createSlice({
  name: 'platformTenants',
  initialState,
  reducers: {
    platformTenantsListParamsUpdated: (
      state,
      action: PayloadAction<PlatformTenantsListParams>,
    ): void => {
      state.params = action.payload;
    },
    platformTenantsListFetchRequested: (state): void => {
      state.isLoading = true;
      state.error = null;
      state.items = [];
      state.total = 0;
    },
    platformTenantsListFetchSucceeded: (
      state,
      action: PayloadAction<PlatformTenantListData>,
    ): void => {
      state.isLoading = false;
      state.items = action.payload.items;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.limit = action.payload.limit;
      state.error = null;
    },
    platformTenantsListFetchFailed: (state, action: PayloadAction<string>): void => {
      state.isLoading = false;
      state.error = action.payload;
    },
    platformTenantMutationStarted: (state): void => {
      state.isMutationPending = true;
      state.mutationError = null;
    },
    platformTenantMutationFinished: (state): void => {
      state.isMutationPending = false;
    },
    platformTenantMutationFailed: (state, action: PayloadAction<string>): void => {
      state.isMutationPending = false;
      state.mutationError = action.payload;
    },
    platformTenantMutationErrorCleared: (state): void => {
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  },
});

export const {
  platformTenantsListParamsUpdated,
  platformTenantsListFetchRequested,
  platformTenantsListFetchSucceeded,
  platformTenantsListFetchFailed,
  platformTenantMutationStarted,
  platformTenantMutationFinished,
  platformTenantMutationFailed,
  platformTenantMutationErrorCleared,
} = platformTenantsSlice.actions;
