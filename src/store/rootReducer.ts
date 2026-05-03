import { combineReducers } from '@reduxjs/toolkit';

import { adminAuthSlice } from '@/features/admin/slice/adminAuthSlice';

export const rootReducer = combineReducers({
  adminAuth: adminAuthSlice.reducer,
});
