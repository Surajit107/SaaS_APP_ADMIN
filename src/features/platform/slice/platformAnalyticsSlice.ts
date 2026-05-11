import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { logout } from '@/features/admin/slice/adminAuthSlice';
import type { PlatformAnalyticsData } from '@/lib/api/types';

export const PLATFORM_ANALYTICS_DEFAULT_DAYS = 30;
export const PLATFORM_ANALYTICS_MIN_DAYS = 1;
export const PLATFORM_ANALYTICS_MAX_DAYS = 180;

export interface PlatformAnalyticsState {
  /** Days requested for the time-series window. Mirrors the backend DTO bounds. */
  days: number;
  data: PlatformAnalyticsData | null;
  isLoading: boolean;
  /** True when an in-flight refresh is replacing existing data; UI keeps last data visible. */
  isRefreshing: boolean;
  error: string | null;
  /** ISO timestamp of the last successful fetch (UI footer / "as of" display). */
  lastUpdatedAt: string | null;
}

function clampDays(value: number): number {
  if (!Number.isFinite(value)) {
    return PLATFORM_ANALYTICS_DEFAULT_DAYS;
  }
  const n = Math.floor(value);
  if (n < PLATFORM_ANALYTICS_MIN_DAYS) {
    return PLATFORM_ANALYTICS_MIN_DAYS;
  }
  if (n > PLATFORM_ANALYTICS_MAX_DAYS) {
    return PLATFORM_ANALYTICS_MAX_DAYS;
  }
  return n;
}

const initialState: PlatformAnalyticsState = {
  days: PLATFORM_ANALYTICS_DEFAULT_DAYS,
  data: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastUpdatedAt: null,
};

export const platformAnalyticsSlice = createSlice({
  name: 'platformAnalytics',
  initialState,
  reducers: {
    platformAnalyticsDaysUpdated: (state, action: PayloadAction<number>): void => {
      state.days = clampDays(action.payload);
    },
    platformAnalyticsFetchRequested: (state): void => {
      if (state.data === null) {
        state.isLoading = true;
      } else {
        state.isRefreshing = true;
      }
      state.error = null;
    },
    platformAnalyticsFetchSucceeded: (
      state,
      action: PayloadAction<PlatformAnalyticsData>,
    ): void => {
      state.isLoading = false;
      state.isRefreshing = false;
      state.data = action.payload;
      state.lastUpdatedAt = new Date().toISOString();
      state.error = null;
    },
    platformAnalyticsFetchFailed: (
      state,
      action: PayloadAction<string>,
    ): void => {
      state.isLoading = false;
      state.isRefreshing = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  },
});

export const {
  platformAnalyticsDaysUpdated,
  platformAnalyticsFetchRequested,
  platformAnalyticsFetchSucceeded,
  platformAnalyticsFetchFailed,
} = platformAnalyticsSlice.actions;
