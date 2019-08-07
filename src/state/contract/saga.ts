import { Moment } from 'moment';
import { put, select, takeLatest } from 'redux-saga/effects';
import { facts } from 'src/constants/facts';
import { IAsyncAction, IAsyncState } from 'src/core/redux/asyncAction';
import { putAndTakeAsync, takeEveryLatest } from 'src/core/redux/saga';
import { getServices } from 'src/ioc/services';
import { ContractState, IContract, IFactReport, IFactReportEntry } from 'src/models/contract';
import { IISP } from 'src/models/isp';
import { enableMetamask } from 'src/utils/metamask';
import { getBlockDate, sendTx, waitReceipt } from 'src/utils/tx';
import { FactHistoryReader, FactReader, FactWriter, IHistoryEvent, PassportOwnership, PassportReader } from 'verifiable-data';
import { loadISPs } from '../isp/action';
import { IState } from '../rootReducer';
import { createContract, IContractCreatePayload, ILoadReportingHistoryPayload, IReportFactPayload, loadContract, loadContracts, loadReportingHistory, reportFact } from './action';

// #region -------------- Contract loading -------------------------------------------------------------------

function* onLoadContracts(action: IAsyncAction<void>) {
  try {
    const { web3 } = getServices();
    const passReader = new PassportReader(web3);

    // Ensure all ISPs are loaded
    yield putAndTakeAsync(loadISPs, a => a.init(null, { cacheTimeout: -1 }));

    const isps = yield select((s: IState) => s.isp.loaded);

    // Fetch contracts for each ISP
    for (const ispPassportAddress in isps) {
      if (!isps.hasOwnProperty(ispPassportAddress)) {
        continue;
      }

      const ispState: IAsyncState<IISP> = isps[ispPassportAddress];
      if (!ispState || !ispState.data) {
        continue;
      }

      const events: IHistoryEvent[] = yield passReader.readPassportHistory(ispState.data.passportAddress, {
        key: facts.contractMetadata,
      });

      const factReader = new FactReader(web3, ispState.data.passportAddress);

      for (const event of events) {
        let jsonBytes: number[] = yield factReader.getTxdata(event.factProviderAddress, facts.contractMetadata);
        if (!jsonBytes) {
          continue;
        }

        const contract: IContract = JSON.parse(Buffer.from(jsonBytes).toString('utf8'));
        contract.ispAddress = ispState.data.address;
        contract.ispPassportAddress = ispState.data.passportAddress;
        contract.schoolAddress = event.factProviderAddress;

        // Try to fetch school report for this contract to get connectivity score
        jsonBytes = yield factReader.getTxdata(event.factProviderAddress, `${facts.schoolReport}${contract.id}`);
        if (jsonBytes) {
          const factReport: IFactReport = JSON.parse(Buffer.from(jsonBytes).toString('utf8'));
          contract.connectivityScore = factReport.connectivityScore;
        }

        yield put(loadContract.success(contract, [contract.id]));
      }
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

// function* onLoadContract(action: IAsyncAction<string>) {
//   try {
//     const { web3 } = getServices();
//     const passReader = new PassportReader(web3);

//     let jsonBytes: number[] = yield factReader.getTxdata(event.factProviderAddress, facts.contractMetadata);
//     if (!jsonBytes) {
//       continue;
//     }

//     const contract: IContract = JSON.parse(Buffer.from(jsonBytes).toString('utf8'));
//     contract.ispAddress = ispAddress;
//     contract.schoolAddress = event.factProviderAddress;

//     // Try to fetch school report for this contract to get connectivity score
//     jsonBytes = yield factReader.getTxdata(event.factProviderAddress, `${facts.schoolReport}${contract.id}`);
//     if (jsonBytes) {
//       const factReport: IFactReport = JSON.parse(Buffer.from(jsonBytes).toString('utf8'));
//       contract.connectivityScore = factReport.connectivityScore;
//     }

//     yield put(loadContract.success(contract, [contract.id]));

//   }

//     yield put(loadContract.success(contract, action.subpath));
// } catch (error) {
//   yield getServices().createErrorHandler(error)
//     .onAnyError(function* (friendlyError) {
//       yield put(loadContract.failure(friendlyError, action.payload, action.subpath));
//     })
//     .process();
// }
//}

// #endregion

// #region -------------- Contract creation -------------------------------------------------------------------

function* onCreateContract(action: IAsyncAction<IContractCreatePayload>) {
  try {
    const { web3 } = getServices();
    const { ispPassportAddress, schoolAddress, speed } = action.payload;

    yield enableMetamask();

    const writer = new FactWriter(web3, ispPassportAddress);
    const contract: IContract = {
      id: (window.performance.timing.navigationStart + window.performance.now()).toString(),
      state: ContractState.Active,
      schoolAddress,
      speed,
    };

    const jsonBytes = Array.from(Buffer.from(JSON.stringify(contract), 'utf8'));
    const txConfig = yield writer.setTxdata(facts.contractMetadata, jsonBytes, schoolAddress);

    const txHash = yield sendTx(txConfig);
    yield waitReceipt(txHash);

    const ownership = new PassportOwnership(web3, ispPassportAddress);

    contract.ispPassportAddress = action.payload.ispPassportAddress;
    contract.ispAddress = yield ownership.getOwnerAddress();

    yield put(loadContract.success(contract, [contract.id]));

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
    const { web3 } = getServices();
    const { contract } = action.payload;
    const passReader = new PassportReader(web3);
    const txFactReader = new FactHistoryReader(web3);

    const reports = new Map<string, Partial<IFactReportEntry>>();

    const schoolEvents: IHistoryEvent[] = yield passReader.readPassportHistory(contract.ispPassportAddress, {
      factProviderAddress: contract.schoolAddress,
      key: `${facts.schoolReport}${contract.id}`,
    });

    const ispEvents: IHistoryEvent[] = yield passReader.readPassportHistory(contract.ispPassportAddress, {
      factProviderAddress: contract.ispAddress,
      key: `${facts.ispReport}${contract.id}`,
    });

    const allEvents = [...schoolEvents, ...ispEvents];

    // Get data for all events
    for (const event of allEvents) {
      const jsonBytes = yield txFactReader.getTxdata(event.transactionHash);
      if (!jsonBytes) {
        continue;
      }

      const factReport: IFactReport = JSON.parse(Buffer.from(jsonBytes).toString('utf8'));

      const date: Moment = yield getBlockDate(web3, event.blockNumber);
      const dateStr = date.format('YYYY-MM-DD');

      if (!reports.has(dateStr)) {
        reports.set(dateStr, {
          date: date.startOf('day').toDate(),
        });
      }

      const value = reports.get(dateStr);

      if (event.factProviderAddress === contract.schoolAddress) {
        value.schoolAddress = contract.schoolAddress;
        value.schoolSpeed = factReport.speed;
      } else {
        value.ispAddress = contract.ispAddress;
        value.ispSpeed = factReport.speed;
      }
    }

    const entries = Array.from(reports.values()).sort(e => e.date.getTime());

    yield put(loadReportingHistory.success(entries as IFactReportEntry[], action.subpath));
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
  // takeEveryLatest<IAsyncAction<string>, any>(
  //   loadContract.request.type, a => `${a.type}_${a.payload}`, onLoadContract),
  takeEveryLatest<IAsyncAction<IContractCreatePayload>, any>(
    createContract.request.type, a => `${a.type}_${a.payload.schoolAddress}`, onCreateContract),
  takeEveryLatest<IAsyncAction<IReportFactPayload>, any>(
    reportFact.request.type, a => `${a.type}_${a.payload.contractId}`, onReportFact),
  takeEveryLatest<IAsyncAction<ILoadReportingHistoryPayload>, any>(
    loadReportingHistory.request.type, a => `${a.type}_${a.payload.contract.id}`, onLoadReportingHistory),
];
