import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { logout } from '@/features/admin/slice/adminAuthSlice';

export interface PlatformOverviewState {
  tenantsActive: number | null;
  tenantsPendingPurge: number | null;
  userCount: number | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PlatformOverviewState = {
  tenantsActive: null,
  tenantsPendingPurge: null,
  userCount: null,
  isLoading: false,
  error: null,
};

export const platformOverviewSlice = createSlice({
  name: 'platformOverview',
  initialState,
  reducers: {
    platformOverviewFetchRequested: (state): void => {
      state.isLoading = true;
      state.error = null;
    },
    platformOverviewFetchSucceeded: (
      state,
      action: PayloadAction<{
        tenantsActive: number;
        tenantsPendingPurge: number;
        userCount: number;
      }>,
    ): void => {
      state.isLoading = false;
      state.tenantsActive = action.payload.tenantsActive;
      state.tenantsPendingPurge = action.payload.tenantsPendingPurge;
      state.userCount = action.payload.userCount;
      state.error = null;
    },
    platformOverviewFetchFailed: (state, action: PayloadAction<string>): void => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  },
});

export const {
  platformOverviewFetchRequested,
  platformOverviewFetchSucceeded,
  platformOverviewFetchFailed,
} = platformOverviewSlice.actions;
