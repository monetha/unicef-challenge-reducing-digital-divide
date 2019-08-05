import { takeLatest } from 'redux-saga/effects';
import { actionTypes } from './actions';
import { getServices } from 'src/ioc/services';

// #region -------------- App initialization -------------------------------------------------------------------

function* onAppBootstrapped() {
  const { logger } = getServices();

  logger.info('App bootstrapped');
}

// #endregion

export const appSagas = [
  takeLatest(actionTypes.appBootsrapped, onAppBootstrapped),
];
