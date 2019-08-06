import { put, takeLatest } from 'redux-saga/effects';
import { passportFactoryAddress } from 'src/constants/addresses';
import { facts } from 'src/constants/facts';
import { IAsyncAction } from 'src/core/redux/asyncAction';
import { takeEveryLatest } from 'src/core/redux/saga';
import { getServices } from 'src/ioc/services';
import { IISP } from 'src/models/isp';
import { Address, FactReader, IPassportRef, PassportReader } from 'verifiable-data';
import { loadISP, loadISPs } from './action';

// #region -------------- Loading -------------------------------------------------------------------

function* onLoadISPs(action: IAsyncAction<void>) {
  try {
    const { web3 } = getServices();
    const passReader = new PassportReader(web3);

    const allPassports: IPassportRef[] = yield passReader.getPassportsList(passportFactoryAddress);

    for (const passport of allPassports) {
      const factReader = new FactReader(web3, passport.address);

      const jsonBytes: number[] = yield factReader.getTxdata(passport.ownerAddress, facts.ispMetadata);
      if (!jsonBytes) {
        continue;
      }

      const isp: IISP = JSON.parse(Buffer.from(jsonBytes).toString('utf8'));
      isp.address = passport.ownerAddress;
      isp.passportAddress = passport.address;

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
