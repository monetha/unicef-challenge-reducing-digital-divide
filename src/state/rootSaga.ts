import { all } from 'redux-saga/effects';
import { asyncActionSagas } from 'src/core/redux/asyncActionSaga';
import { appSagas } from './app/saga';
import { ispSaga } from './isp/saga';
import { schoolSaga } from './school/saga';
import { contractSaga } from './contract/saga';

export function* rootSaga() {
  yield all([
    ...asyncActionSagas,
    ...appSagas,
    ...ispSaga,
    ...schoolSaga,
    ...contractSaga,
  ]);
}
