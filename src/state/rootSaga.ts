import { all } from 'redux-saga/effects';
import { asyncActionSagas } from 'src/core/redux/asyncActionSaga';
import { appSagas } from './app/saga';

export function* rootSaga() {
  yield all([
    ...asyncActionSagas,
    ...appSagas,
  ]);
}
