import { put, takeLatest } from 'redux-saga/effects';
import { IAsyncAction } from 'src/core/redux/asyncAction';
import { takeEveryLatest } from 'src/core/redux/saga';
import { getServices } from 'src/ioc/services';
import { ContractState, IContract } from 'src/models/contract';
import { loadContract, loadContracts } from './action';

// #region -------------- Loading -------------------------------------------------------------------

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

export const contractSaga = [
  takeLatest(loadContracts.request.type, onLoadContracts),
  takeEveryLatest<IAsyncAction<string>, any>(
    loadContract.request.type, a => `${a.type}_${a.payload}`, onLoadContract),
];
