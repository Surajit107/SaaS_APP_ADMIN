import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { PlatformSubscriptionPlanCatalogRow } from '@/lib/api/types';

export type PlanForEditFetchStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface PlanForEditFetchState {
  requestedPlanId: string | null;
  plan: PlatformSubscriptionPlanCatalogRow | null;
  status: PlanForEditFetchStatus;
  error: string | null;
}

export interface PlatformSubscriptionPlansState {
  planForEditFetch: PlanForEditFetchState;
}

const planForEditFetchInitial: PlanForEditFetchState = {
  requestedPlanId: null,
  plan: null,
  status: 'idle',
  error: null,
};

const initialState: PlatformSubscriptionPlansState = {
  planForEditFetch: planForEditFetchInitial,
};

export const platformSubscriptionPlansSlice = createSlice({
  name: 'platformSubscriptionPlans',
  initialState,
  reducers: {
    planForEditFetchStarted: (
      state,
      action: PayloadAction<{ planId: string }>,
    ): void => {
      state.planForEditFetch.requestedPlanId = action.payload.planId;
      state.planForEditFetch.status = 'loading';
      state.planForEditFetch.error = null;
      state.planForEditFetch.plan = null;
    },
    planForEditFetchSucceeded: (
      state,
      action: PayloadAction<PlatformSubscriptionPlanCatalogRow>,
    ): void => {
      state.planForEditFetch.plan = action.payload;
      state.planForEditFetch.requestedPlanId = action.payload.id;
      state.planForEditFetch.status = 'succeeded';
      state.planForEditFetch.error = null;
    },
    planForEditFetchFailed: (state, action: PayloadAction<string>): void => {
      state.planForEditFetch.status = 'failed';
      state.planForEditFetch.error = action.payload;
      state.planForEditFetch.plan = null;
    },
    planForEditFetchCleared: (state): void => {
      state.planForEditFetch = planForEditFetchInitial;
    },
  },
});

export const {
  planForEditFetchStarted,
  planForEditFetchSucceeded,
  planForEditFetchFailed,
  planForEditFetchCleared,
} = platformSubscriptionPlansSlice.actions;
