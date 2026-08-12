import { all, call, put, takeLatest } from 'redux-saga/effects';
import { toast } from 'sonner';

import {
  DISABLE_TOTP,
  ENABLE_TOTP,
  GET_MFA_STATUS,
  PATCH_MFA_PREFERENCES,
  REGENERATE_BACKUP_CODES,
  SETUP_TOTP,
} from '@/lib/api/Api';
import { getApiErrorMessage } from '@/lib/api/errorMessage';
import { logout } from '@/features/admin/slice/adminAuthSlice';
import {
  adminBackupCodesRegenerateRequested,
  adminEmailCodeLoginPreferenceRequested,
  adminMfaStatusSyncRequested,
  adminTotpDisableRequested,
  adminTotpEnableRequested,
  adminTotpSetupRequested,
  backupCodesRegenerateFailed,
  backupCodesRegenerateSucceeded,
  mfaStatusSyncFailed,
  mfaStatusSyncSucceeded,
  preferenceSaveFailed,
  preferenceSaveSucceeded,
  totpDisableFailed,
  totpDisableSucceeded,
  totpEnableFailed,
  totpEnableSucceeded,
  totpSetupFailed,
  totpSetupSucceeded,
} from '@/features/admin/slice/adminSecuritySlice';
import { clearAuthStorage } from '@/lib/auth/tokenStorage';

function* handleMfaStatusSync(): Generator {
  try {
    const response = (yield call(GET_MFA_STATUS)) as Awaited<
      ReturnType<typeof GET_MFA_STATUS>
    >;
    yield put(mfaStatusSyncSucceeded(response.data.data));
  } catch (error: unknown) {
    const message = getApiErrorMessage(
      error,
      'Unable to load your security settings',
    );
    yield put(mfaStatusSyncFailed(message));
  }
}

function* handleTotpSetup(): Generator {
  try {
    const response = (yield call(SETUP_TOTP)) as Awaited<
      ReturnType<typeof SETUP_TOTP>
    >;
    yield put(totpSetupSucceeded(response.data.data));
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, 'Unable to start setup');
    toast.error(message);
    yield put(totpSetupFailed(message));
  }
}

function* handleTotpEnable(
  action: ReturnType<typeof adminTotpEnableRequested>,
): Generator {
  try {
    const response = (yield call(ENABLE_TOTP, {
      code: action.payload.code,
    })) as Awaited<ReturnType<typeof ENABLE_TOTP>>;
    toast.success(response.data.message);
    yield put(totpEnableSucceeded(response.data.data));
    yield put(adminMfaStatusSyncRequested());
  } catch (error: unknown) {
    const message = getApiErrorMessage(
      error,
      'Unable to turn on two-factor authentication',
    );
    yield put(totpEnableFailed(message));
  }
}

/**
 * Turning 2FA off revokes every refresh token server-side, so the local session
 * is already dead — tear it down here instead of letting it fail on next refresh.
 */
function* handleTotpDisable(
  action: ReturnType<typeof adminTotpDisableRequested>,
): Generator {
  try {
    const response = (yield call(DISABLE_TOTP, {
      password: action.payload.password,
      code: action.payload.code,
    })) as Awaited<ReturnType<typeof DISABLE_TOTP>>;

    yield put(totpDisableSucceeded(response.data.data));
    toast.success(response.data.message);
    toast.info('All sessions were signed out. Please sign in again.');

    clearAuthStorage();
    yield put(logout());
  } catch (error: unknown) {
    const message = getApiErrorMessage(
      error,
      'Unable to turn off two-factor authentication',
    );
    yield put(totpDisableFailed(message));
  }
}

function* handleBackupCodesRegenerate(
  action: ReturnType<typeof adminBackupCodesRegenerateRequested>,
): Generator {
  try {
    const response = (yield call(REGENERATE_BACKUP_CODES, {
      password: action.payload.password,
    })) as Awaited<ReturnType<typeof REGENERATE_BACKUP_CODES>>;
    toast.success(response.data.message);
    yield put(backupCodesRegenerateSucceeded(response.data.data));
    yield put(adminMfaStatusSyncRequested());
  } catch (error: unknown) {
    const message = getApiErrorMessage(
      error,
      'Unable to generate new recovery codes',
    );
    yield put(backupCodesRegenerateFailed(message));
  }
}

function* handleEmailCodePreference(
  action: ReturnType<typeof adminEmailCodeLoginPreferenceRequested>,
): Generator {
  try {
    const response = (yield call(PATCH_MFA_PREFERENCES, {
      isEmailCodeLoginEnabled: action.payload.isEmailCodeLoginEnabled,
    })) as Awaited<ReturnType<typeof PATCH_MFA_PREFERENCES>>;
    yield put(preferenceSaveSucceeded(response.data.data));
    toast.success(
      action.payload.isEmailCodeLoginEnabled
        ? 'Sign-in codes by email are on.'
        : 'Sign-in codes by email are off.',
    );
  } catch (error: unknown) {
    const message = getApiErrorMessage(
      error,
      'Unable to update your sign-in preferences',
    );
    yield put(preferenceSaveFailed(message));
  }
}

export function* adminSecuritySaga(): Generator {
  yield all([
    takeLatest(adminMfaStatusSyncRequested.type, handleMfaStatusSync),
    takeLatest(adminTotpSetupRequested.type, handleTotpSetup),
    takeLatest(adminTotpEnableRequested.type, handleTotpEnable),
    takeLatest(adminTotpDisableRequested.type, handleTotpDisable),
    takeLatest(
      adminBackupCodesRegenerateRequested.type,
      handleBackupCodesRegenerate,
    ),
    takeLatest(
      adminEmailCodeLoginPreferenceRequested.type,
      handleEmailCodePreference,
    ),
  ]);
}
