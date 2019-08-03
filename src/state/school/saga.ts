import { takeLatest, put } from 'redux-saga/effects';
import { loadSchools, loadSchool } from './action';
import { IAsyncAction } from 'src/core/redux/asyncAction';
import { getServices } from 'src/ioc/services';
import { takeEveryLatest } from 'src/core/redux/saga';
import { ISchool } from 'src/models/school';
import { Address } from 'verifiable-data';
import { Country } from 'src/constants/countries';

// #region -------------- Loading -------------------------------------------------------------------

function* onLoadSchools(action: IAsyncAction<void>) {
  try {
    // TODO:',
    const schools: ISchool[] = [
      {
        address: '0x123456789',
        name: `Name_School_1`,
        score: 0.5,
        country: Country.ABW,
      },
      {
        address: '0x321abc321',
        name: `Name_School_1`,
        score: 0.1,
        country: Country.ABW,
      },
      {
        address: '0xabcdefabcdef',
        name: `Name_School_2`,
        score: 0.8,
        country: Country.ZMB,
      },
    ];

    for (const school of schools) {
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
    // TODO:
    const school: ISchool = {
      address: action.payload,
      name: `Name_School_${action.payload}`,
      score: 1,
      country: Country.LTU,
    };

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
