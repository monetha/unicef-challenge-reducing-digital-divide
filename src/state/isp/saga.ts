import { takeLatest, put } from 'redux-saga/effects';
import { loadISPs, loadISP } from './action';
import { IAsyncAction } from 'src/core/redux/asyncAction';
import { getServices } from 'src/ioc/services';
import { takeEveryLatest } from 'src/core/redux/saga';
import { IISP } from 'src/models/isp';
import { Address } from 'verifiable-data';

// #region -------------- Loading -------------------------------------------------------------------

function* onLoadISPs(action: IAsyncAction<void>) {
  try {
    // TODO:
    const addresses = [
      '0x123456789',
      '0xabcdefabcdef',
    ];

    for (const address of addresses) {
      const isp: IISP = {
        address,
        name: `Name_ISP_${action.payload}`,
        score: 0.5,
      };

      yield put(loadISP.success(isp, [isp.address]));
    }

    yield put(loadISPs.success());

  } catch (error) {
    yield getServices().createErrorHandler(error)
      .onAnyError(function* (friendlyError) {
        yield put(loadISPs.failure(friendlyError, action.payload));
      })
      .process();
  }
}

function* onLoadISP(action: IAsyncAction<Address>) {
  try {
    // TODO:
    const isp: IISP = {
      address: action.payload,
      name: `Name_ISP_${action.payload}`,
      score: 0.5,
    };

    yield put(loadISP.success(isp, action.subpath));
  } catch (error) {
    yield getServices().createErrorHandler(error)
      .onAnyError(function* (friendlyError) {
        yield put(loadISP.failure(friendlyError, action.payload, action.subpath));
      })
      .process();
  }
}

// #endregion

export const ispSaga = [
  takeLatest(loadISPs.request.type, onLoadISPs),
  takeEveryLatest<IAsyncAction<Address>, any>(
    loadISP.request.type, a => `${a.type}_${a.payload}`, onLoadISP),
];
