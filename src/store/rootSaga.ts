import { all, fork } from 'redux-saga/effects';

import { adminAuthSaga } from '@/features/admin/saga/adminAuthSaga';

export function* rootSaga(): Generator {
  yield all([fork(adminAuthSaga)]);
}
