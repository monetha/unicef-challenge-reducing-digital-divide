import { put, takeLatest } from 'redux-saga/effects';
import { unicefPassportAddress } from 'src/constants/addresses';
import { facts } from 'src/constants/facts';
import { IAsyncAction } from 'src/core/redux/asyncAction';
import { takeEveryLatest } from 'src/core/redux/saga';
import { getServices } from 'src/ioc/services';
import { ISchool } from 'src/models/school';
import { Address, FactReader, IHistoryEvent, PassportReader } from 'verifiable-data';
import { loadSchool, loadSchools } from './action';

// #region -------------- Loading -------------------------------------------------------------------

function* onLoadSchools(action: IAsyncAction<void>) {
  try {
    const { web3 } = getServices();
    const passReader = new PassportReader(web3);

    const factEvents: IHistoryEvent[] = yield passReader.readPassportHistory(unicefPassportAddress, {
      key: facts.schoolMetadata,
    });

    const factReader = new FactReader(web3, unicefPassportAddress);

    for (const factEvent of factEvents) {
      const jsonBytes: number[] = yield factReader.getTxdata(factEvent.factProviderAddress, factEvent.key);
      if (!jsonBytes) {
        continue;
      }

      const school: ISchool = JSON.parse(Buffer.from(jsonBytes).toString('utf8'));
      school.address = factEvent.factProviderAddress;

      yield put(loadSchool.success(school, [school.address]));
    }

    yield put(loadSchools.success());

  } catch (error) {
    yield getServices().createErrorHandler(error)
      .onAnyError(function* (friendlyError) {
        yield put(loadSchools.failure(friendlyError, action.payload));
      })
      .process();
  }
}

function* onLoadSchool(action: IAsyncAction<Address>) {
  try {
    const { web3 } = getServices();
    const factReader = new FactReader(web3, unicefPassportAddress);

    const jsonBytes: number[] = yield factReader.getTxdata(action.payload, facts.schoolMetadata);
    if (!jsonBytes) {
      throw new Error('School does not exist');
    }

    const school: ISchool = JSON.parse(Buffer.from(jsonBytes).toString('utf8'));
    school.address = action.payload;

    yield put(loadSchool.success(school, action.subpath));
  } catch (error) {
    yield getServices().createErrorHandler(error)
      .onAnyError(function* (friendlyError) {
        yield put(loadSchool.failure(friendlyError, action.payload, action.subpath));
      })
      .process();
  }
}

// #endregion

export const schoolSaga = [
  takeLatest(loadSchools.request.type, onLoadSchools),
  takeEveryLatest<IAsyncAction<Address>, any>(
    loadSchool.request.type, a => `${a.type}_${a.payload}`, onLoadSchool),
];
