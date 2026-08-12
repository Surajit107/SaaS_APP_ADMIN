import { all, fork } from 'redux-saga/effects';

import { adminAuthSaga } from '@/features/admin/saga/adminAuthSaga';
import { adminSecuritySaga } from '@/features/admin/saga/adminSecuritySaga';
import { platformSaga } from '@/features/platform/saga/platformSaga';

export function* rootSaga(): Generator {
  yield all([fork(adminAuthSaga), fork(adminSecuritySaga), fork(platformSaga)]);
}
