import { put, takeLatest } from 'redux-saga/effects';
import { IAsyncAction } from 'src/core/redux/asyncAction';
import { takeEveryLatest } from 'src/core/redux/saga';
import { getServices } from 'src/ioc/services';
import { ContractState, IContract, IFactReportEntry } from 'src/models/contract';
import { loadContract, loadContracts, IContractCreatePayload, createContract, IReportFactPayload, reportFact, ILoadReportingHistoryPayload, loadReportingHistory } from './action';
import moment from 'moment';

// #region -------------- Contract loading -------------------------------------------------------------------

function* onLoadContracts(action: IAsyncAction<void>) {
  try {
    // TODO:
    const contracts: IContract[] = [
      {
        id: '0',
        schoolAddress: '0x123456789',
        ispAddress: '0x123456789',
        speed: 50,
        state: ContractState.Active,
        connectivityScore: 0.8,
      },
      {
        id: '1',
        schoolAddress: '0xabcdefabcdef',
        ispAddress: '0xabcdefabcdef',
        speed: 20,
        state: ContractState.Active,
        connectivityScore: 0.2,
      },
    ];

    for (const contract of contracts) {
      yield put(loadContract.success(contract, [contract.id]));
    }

    yield put(loadContracts.success());

  } catch (error) {
    yield getServices().createErrorHandler(error)
      .onAnyError(function* (friendlyError) {
        yield put(loadContracts.failure(friendlyError, action.payload));
      })
      .process();
  }
}

function* onLoadContract(action: IAsyncAction<string>) {
  try {
    // TODO:
    const contract: IContract = {
      id: action.payload,
      schoolAddress: '0x123456789',
      ispAddress: '0x123456789',
      speed: 10,
      state: ContractState.Active,
      connectivityScore: 0.5,
    };

    yield put(loadContract.success(contract, action.subpath));
  } catch (error) {
    yield getServices().createErrorHandler(error)
      .onAnyError(function* (friendlyError) {
        yield put(loadContract.failure(friendlyError, action.payload, action.subpath));
      })
      .process();
  }
}

// #endregion

// #region -------------- Contract creation -------------------------------------------------------------------

function* onCreateContract(action: IAsyncAction<IContractCreatePayload>) {
  try {

    yield put(createContract.success(null, action.subpath));
  } catch (error) {
    yield getServices().createErrorHandler(error)
      .onAnyError(function* (friendlyError) {
        yield put(createContract.failure(friendlyError, action.payload, action.subpath));
      })
      .process();
  }
}

// #endregion

// #region -------------- Fact reports -------------------------------------------------------------------

function* onReportFact(action: IAsyncAction<IReportFactPayload>) {
  try {

    yield put(reportFact.success(null, action.subpath));
  } catch (error) {
    yield getServices().createErrorHandler(error)
      .onAnyError(function* (friendlyError) {
        yield put(reportFact.failure(friendlyError, action.payload, action.subpath));
      })
      .process();
  }
}

function* onLoadReportingHistory(action: IAsyncAction<ILoadReportingHistoryPayload>) {
  try {
    // TODO:
    const mockEntries: IFactReportEntry[] = [
      {
        date: moment().subtract(4, 'day').toDate(),
        ispAddress: '0x123',
        ispSpeed: 70,
        schoolAddress: '0x321',
        schoolSpeed: 72,
      },
      {
        date: moment().subtract(3, 'day').toDate(),
        ispAddress: '0x123',
        ispSpeed: 70,
        schoolAddress: '0x321',
        schoolSpeed: 15,
      },
      {
        date: moment().subtract(2, 'day').toDate(),
        ispAddress: '0x123',
        ispSpeed: 50,
        schoolAddress: '0x321',
        schoolSpeed: 3,
      },
      {
        date: moment().subtract(1, 'day').toDate(),
        ispAddress: '0x123',
        ispSpeed: 60,
        schoolAddress: '0x321',
        schoolSpeed: 65,
      },
      {
        date: moment().toDate(),
        ispAddress: '0x123',
        ispSpeed: 65,
        schoolAddress: '0x321',
        schoolSpeed: 30,
      },
    ];

    yield put(loadReportingHistory.success(mockEntries, action.subpath));
  } catch (error) {
    yield getServices().createErrorHandler(error)
      .onAnyError(function* (friendlyError) {
        yield put(loadReportingHistory.failure(friendlyError, action.payload, action.subpath));
      })
      .process();
  }
}

// #endregion

export const contractSaga = [
  takeLatest(loadContracts.request.type, onLoadContracts),
  takeEveryLatest<IAsyncAction<string>, any>(
    loadContract.request.type, a => `${a.type}_${a.payload}`, onLoadContract),
  takeEveryLatest<IAsyncAction<IContractCreatePayload>, any>(
    createContract.request.type, a => `${a.type}_${a.payload.schoolAddress}`, onCreateContract),
  takeEveryLatest<IAsyncAction<IReportFactPayload>, any>(
    reportFact.request.type, a => `${a.type}_${a.payload.contractId}`, onReportFact),
  takeEveryLatest<IAsyncAction<ILoadReportingHistoryPayload>, any>(
    loadReportingHistory.request.type, a => `${a.type}_${a.payload.contractId}`, onLoadReportingHistory),
];