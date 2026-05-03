import { createAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import { toast } from 'sonner';

import { LOGIN, LOGOUT, REFRESH_TOKEN, type LoginPayload } from '@/lib/api/Api';
import { getApiErrorMessage } from '@/lib/api/errorMessage';
import {
  loginFailed,
  loginSucceeded,
  logout,
  logoutFailed,
  logoutRequested,
} from '@/features/admin/slice/adminAuthSlice';
import { clearAuthStorage, getRefreshToken, storeAuthTokens } from '@/lib/auth/tokenStorage';

export const adminLoginRequested = createAction<{
  email: string;
  password: string;
}>('adminAuth/loginRequested');

export const adminSessionSyncRequested = createAction('adminAuth/sessionSyncRequested');

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
    const session = response.data.data;

    if (session.user.platformAdmin !== true) {
      toast.error('This account is not a platform admin account');
      yield put(loginFailed('This account is not a platform admin account'));
      return;
    }

    storeAuthTokens(session.accessToken, session.refreshToken);
    toast.success('Admin login successful');
    yield put(loginSucceeded({ email: session.user.email }));
  } catch (error: unknown) {
    const message = getApiErrorMessage(error);
    toast.error(message);
    yield put(loginFailed(message));
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
  yield takeLatest(logoutRequested.type, handleLogout);
  yield takeLatest(adminSessionSyncRequested.type, handleAdminSessionSync);
}
