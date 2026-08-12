import { createAction } from '@reduxjs/toolkit';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { toast } from 'sonner';

import {
  LOGIN,
  LOGOUT,
  REFRESH_TOKEN,
  REQUEST_LOGIN_CODE,
  VERIFY_MFA,
  type AuthSessionData,
  type LoginPayload,
} from '@/lib/api/Api';
import { getApiErrorMessage } from '@/lib/api/errorMessage';
import {
  loginCodeRequestFailed,
  loginCodeRequestStarted,
  loginFailed,
  loginSucceeded,
  logout,
  logoutFailed,
  logoutRequested,
  mfaChallengeAbandoned,
  mfaChallengeIssued,
  mfaVerifyFailed,
  mfaVerifyStarted,
} from '@/features/admin/slice/adminAuthSlice';
import { isMfaRequiredResult } from '@/lib/auth/mfa';
import { clearAuthStorage, getRefreshToken, storeAuthTokens } from '@/lib/auth/tokenStorage';

const NOT_PLATFORM_ADMIN = 'This account is not a platform admin account';

export const adminLoginRequested = createAction<{
  email: string;
  password: string;
}>('adminAuth/loginRequested');

/** Second step of a login that answered with an MFA challenge. */
export const adminMfaVerifyRequested = createAction<{
  code: string;
}>('adminAuth/mfaVerifyRequested');

/** Passwordless entry: email a one-time code instead of asking for a password. */
export const adminLoginCodeRequested = createAction<{ email: string }>(
  'adminAuth/loginCodeRequested',
);

export const adminSessionSyncRequested = createAction('adminAuth/sessionSyncRequested');

/**
 * Shared tail of both login paths: the console is platform-admin only, so a
 * tenant account gets its freshly minted tokens dropped rather than stored.
 */
function* establishAdminSession(session: AuthSessionData): Generator<unknown, boolean> {
  if (session.user.platformAdmin !== true) {
    toast.error(NOT_PLATFORM_ADMIN);
    return false;
  }

  storeAuthTokens(session.accessToken, session.refreshToken);
  toast.success('Admin login successful');
  yield put(loginSucceeded({ email: session.user.email }));
  return true;
}

function* handleAdminLogin(
  action: ReturnType<typeof adminLoginRequested>,
): Generator {
  try {
    const payload: LoginPayload = {
      email: action.payload.email,
      password: action.payload.password,
      authScope: 'platform',
    };
    const response = (yield call(LOGIN, payload)) as Awaited<ReturnType<typeof LOGIN>>;
    const result = response.data.data;

    // With 2FA on, no session exists yet — only a ticket to spend on a code.
    if (isMfaRequiredResult(result)) {
      yield put(
        mfaChallengeIssued({
          challengeToken: result.challengeToken,
          methods: result.methods,
          expiresAt: result.expiresAt,
          email: action.payload.email,
        }),
      );
      return;
    }

    const established = (yield* establishAdminSession(result)) as boolean;
    if (!established) {
      yield put(loginFailed(NOT_PLATFORM_ADMIN));
    }
  } catch (error: unknown) {
    const message = getApiErrorMessage(error);
    toast.error(message);
    yield put(loginFailed(message));
  }
}

function* handleAdminLoginCodeRequest(
  action: ReturnType<typeof adminLoginCodeRequested>,
): Generator {
  try {
    yield put(loginCodeRequestStarted());
    const response = (yield call(REQUEST_LOGIN_CODE, {
      email: action.payload.email,
      authScope: 'platform',
    })) as Awaited<ReturnType<typeof REQUEST_LOGIN_CODE>>;

    // Identical answer for unknown addresses, so this runs either way.
    const result = response.data.data;
    toast.success(response.data.message);
    yield put(
      mfaChallengeIssued({
        challengeToken: result.challengeToken,
        methods: result.methods,
        expiresAt: result.expiresAt,
        email: action.payload.email,
      }),
    );
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, 'Unable to send a sign-in code');
    toast.error(message);
    yield put(loginCodeRequestFailed(message));
  }
}

function* handleAdminMfaVerify(
  action: ReturnType<typeof adminMfaVerifyRequested>,
): Generator {
  const challengeToken = (yield select(
    (state: { adminAuth: { mfaChallenge: { challengeToken: string } | null } }) =>
      state.adminAuth.mfaChallenge?.challengeToken ?? null,
  )) as string | null;

  if (challengeToken === null) {
    yield put(mfaVerifyFailed('This sign-in attempt expired. Start again.'));
    return;
  }

  yield put(mfaVerifyStarted());
  try {
    const response = (yield call(VERIFY_MFA, {
      challengeToken,
      code: action.payload.code,
    })) as Awaited<ReturnType<typeof VERIFY_MFA>>;

    const established = (yield* establishAdminSession(response.data.data)) as boolean;
    if (!established) {
      // The challenge is spent either way; send them back to the password form.
      yield put(mfaChallengeAbandoned());
      yield put(loginFailed(NOT_PLATFORM_ADMIN));
    }
  } catch (error: unknown) {
    const message = getApiErrorMessage(error);
    yield put(mfaVerifyFailed(message));
  }
}

function* handleLogout(): Generator {
  let logoutRequestSucceeded = true;
  try {
    const refreshToken = getRefreshToken();
    yield call(LOGOUT, refreshToken !== null ? { refreshToken } : {});
    toast.success('Logged out successfully');
  } catch (error: unknown) {
    logoutRequestSucceeded = false;
    const message = getApiErrorMessage(error);
    toast.error(message);
    yield put(logoutFailed(message));
  } finally {
    clearAuthStorage();
    if (!logoutRequestSucceeded) {
      toast.info('Local session cleared for security');
    }
    yield put(logout());
  }
}

function* handleAdminSessionSync(): Generator {
  try {
    const refreshToken = getRefreshToken();
    const response = (yield call(
      REFRESH_TOKEN,
      refreshToken !== null ? { refreshToken } : {},
    )) as Awaited<ReturnType<typeof REFRESH_TOKEN>>;
    const session = response.data.data;
    if (session.user.platformAdmin !== true) {
      throw new Error('This account is not a platform admin account');
    }
    storeAuthTokens(session.accessToken, session.refreshToken);
    yield put(loginSucceeded({ email: session.user.email }));
  } catch (error: unknown) {
    const message = getApiErrorMessage(error);
    yield put(loginFailed(message));
    clearAuthStorage();
    yield put(logout());
  }
}

export function* adminAuthSaga(): Generator {
  yield takeLatest(adminLoginRequested.type, handleAdminLogin);
  yield takeLatest(adminMfaVerifyRequested.type, handleAdminMfaVerify);
  yield takeLatest(adminLoginCodeRequested.type, handleAdminLoginCodeRequest);
  yield takeLatest(logoutRequested.type, handleLogout);
  yield takeLatest(adminSessionSyncRequested.type, handleAdminSessionSync);
}
