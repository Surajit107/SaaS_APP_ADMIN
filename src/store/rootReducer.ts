import { combineReducers } from '@reduxjs/toolkit';

import { adminAuthSlice } from '@/features/admin/slice/adminAuthSlice';
import { platformAnalyticsSlice } from '@/features/platform/slice/platformAnalyticsSlice';
import { platformOverviewSlice } from '@/features/platform/slice/platformOverviewSlice';
import { platformSubscriptionPlansSlice } from '@/features/platform/slice/platformSubscriptionPlansSlice';
import { platformTenantsSlice } from '@/features/platform/slice/platformTenantsSlice';

export const rootReducer = combineReducers({
  adminAuth: adminAuthSlice.reducer,
  platformAnalytics: platformAnalyticsSlice.reducer,
  platformOverview: platformOverviewSlice.reducer,
  platformTenants: platformTenantsSlice.reducer,
  platformSubscriptionPlans: platformSubscriptionPlansSlice.reducer,
});
