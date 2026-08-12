import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
  loadAdminSession,
  persistAdminSession,
} from '@/lib/auth/portalSession';
import type { MfaChallengeMethod } from '@/lib/api/types';

/**
 * A first factor that passed, waiting on a second. Held in memory only — the
 * challenge token is a credential and expires in minutes.
 */
export interface AdminMfaChallenge {
  challengeToken: string;
  methods: MfaChallengeMethod[];
  /** ISO timestamp; after this the operator has to start from the password again. */
  expiresAt: string;
  /** Echoed back for display, so the second step can name the account. */
  email: string;
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  email: string | null;
  isLoading: boolean;
  error: string | null;
  /** POST /auth/logout in flight — isolated from login `isLoading`. */
  isLogoutPending: boolean;
  /** Password accepted, second factor outstanding; null when no login is mid-flight. */
  mfaChallenge: AdminMfaChallenge | null;
  isMfaVerifying: boolean;
  /** Errors from the second step only — kept apart from the password form's `error`. */
  mfaError: string | null;
  /** POST /auth/login/email-code in flight. */
  isLoginCodeRequestPending: boolean;
}

const hydrated = loadAdminSession();
const initialState: AdminAuthState = {
  isAuthenticated: hydrated.isAuthenticated,
  email: hydrated.email,
  isLoading: false,
  error: null,
  isLogoutPending: false,
  mfaChallenge: null,
  isMfaVerifying: false,
  mfaError: null,
  isLoginCodeRequestPending: false,
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
      state.mfaChallenge = null;
      state.isMfaVerifying = false;
      state.mfaError = null;
    },
    /** `/auth/login` accepted the password but wants a second factor. */
    mfaChallengeIssued: (
      state,
      action: PayloadAction<AdminMfaChallenge>,
    ): void => {
      state.isLoading = false;
      state.error = null;
      state.mfaChallenge = action.payload;
      state.isMfaVerifying = false;
      state.mfaError = null;
      state.isLoginCodeRequestPending = false;
    },
    loginCodeRequestStarted: (state): void => {
      state.isLoginCodeRequestPending = true;
      state.error = null;
    },
    loginCodeRequestFailed: (state, action: PayloadAction<string>): void => {
      state.isLoginCodeRequestPending = false;
      state.error = action.payload;
    },
    mfaVerifyStarted: (state): void => {
      state.isMfaVerifying = true;
      state.mfaError = null;
    },
    mfaVerifyFailed: (state, action: PayloadAction<string>): void => {
      state.isMfaVerifying = false;
      state.mfaError = action.payload;
    },
    /** Abandons the pending challenge and returns the operator to the password form. */
    mfaChallengeAbandoned: (state): void => {
      state.mfaChallenge = null;
      state.isMfaVerifying = false;
      state.mfaError = null;
      state.isLoginCodeRequestPending = false;
    },
    clearMfaError: (state): void => {
      state.mfaError = null;
    },
    loginSucceeded: (
      state,
      action: PayloadAction<{ email: string }>,
    ): void => {
      state.isAuthenticated = true;
      state.email = action.payload.email;
      state.isLoading = false;
      state.error = null;
      state.mfaChallenge = null;
      state.isMfaVerifying = false;
      state.mfaError = null;
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
      state.mfaChallenge = null;
      state.isMfaVerifying = false;
      state.mfaError = null;
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
  mfaChallengeIssued,
  mfaVerifyStarted,
  mfaVerifyFailed,
  mfaChallengeAbandoned,
  clearMfaError,
  loginCodeRequestStarted,
  loginCodeRequestFailed,
  logoutRequested,
  logout,
  logoutFailed,
} = adminAuthSlice.actions;
