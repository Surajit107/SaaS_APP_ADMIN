import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
  loadAdminSession,
  persistAdminSession,
} from '@/lib/auth/portalSession';

export interface AdminAuthState {
  isAuthenticated: boolean;
  email: string | null;
  isLoading: boolean;
  error: string | null;
  /** POST /auth/logout in flight — isolated from login `isLoading`. */
  isLogoutPending: boolean;
}

const hydrated = loadAdminSession();
const initialState: AdminAuthState = {
  isAuthenticated: hydrated.isAuthenticated,
  email: hydrated.email,
  isLoading: false,
  error: null,
  isLogoutPending: false,
};

export const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    clearError: (state): void => {
      state.error = null;
    },
    loginRequested: (state): void => {
      state.isLoading = true;
      state.error = null;
    },
    loginSucceeded: (
      state,
      action: PayloadAction<{ email: string }>,
    ): void => {
      state.isAuthenticated = true;
      state.email = action.payload.email;
      state.isLoading = false;
      state.error = null;
      persistAdminSession({
        isAuthenticated: true,
        email: state.email,
      });
    },
    loginFailed: (state, action: PayloadAction<string>): void => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logoutRequested: (state): void => {
      state.isLogoutPending = true;
      state.error = null;
    },
    logout: (state): void => {
      state.isAuthenticated = false;
      state.email = null;
      state.isLoading = false;
      state.isLogoutPending = false;
      state.error = null;
      persistAdminSession({
        isAuthenticated: false,
        email: null,
      });
    },
    logoutFailed: (state, action: PayloadAction<string>): void => {
      state.isLogoutPending = false;
      state.error = action.payload;
    },
  },
});

export const {
  clearError,
  loginRequested,
  loginSucceeded,
  loginFailed,
  logoutRequested,
  logout,
  logoutFailed,
} = adminAuthSlice.actions;
