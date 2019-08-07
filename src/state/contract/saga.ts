import moment, { Moment } from 'moment';
import { put, select, takeLatest } from 'redux-saga/effects';
import { facts } from 'src/constants/facts';
import { ErrorCode } from 'src/core/error/ErrorCode';
import { createFriendlyError } from 'src/core/error/FriendlyError';
import { IAsyncAction, IAsyncState } from 'src/core/redux/asyncAction';
import { putAndTakeAsync, takeEveryLatest } from 'src/core/redux/saga';
import { getServices } from 'src/ioc/services';
import { ContractState, IContract, IFactReport, IFactReportEntry } from 'src/models/contract';
import { IISP } from 'src/models/isp';
import { enableMetamask, getCurrentAccountAddress } from 'src/utils/metamask';
import { getBlockDate, sendTx, waitReceipt } from 'src/utils/tx';
import { FactHistoryReader, FactReader, FactWriter, IHistoryEvent, PassportOwnership, PassportReader } from 'verifiable-data';
import { loadISPs } from '../isp/action';
import { IState } from '../rootReducer';
import { createContract, IContractCreatePayload, ILoadReportingHistoryPayload, IReportFactPayload, loadContract, loadContracts, loadReportingHistory, reportFact, ILoadContractPayload } from './action';

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

        // Get contract creation date
        const date: Moment = yield getBlockDate(web3, event.blockNumber);
        contract.date = date.toDate();

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

function* onLoadContract(action: IAsyncAction<ILoadContractPayload>) {
  try {
    const { web3 } = getServices();
    const factReader = new FactReader(web3, action.payload.ispPassportAddress);

    let jsonBytes: number[] = yield factReader.getTxdata(action.payload.schoolAddress, facts.contractMetadata);
    if (!jsonBytes) {
      throw createFriendlyError(ErrorCode.RESOURCE_NOT_FOUND, 'Specified contract was not found');
    }

    const contract: IContract = JSON.parse(Buffer.from(jsonBytes).toString('utf8'));
    contract.schoolAddress = action.payload.schoolAddress;

    const ownership = new PassportOwnership(web3, action.payload.ispPassportAddress);
    contract.ispAddress = yield ownership.getOwnerAddress();

    // TODO: - date must be fetched from history
    contract.date = null;

    // Try to fetch school report for this contract to get connectivity score
    jsonBytes = yield factReader.getTxdata(action.payload.schoolAddress, `${facts.schoolReport}${contract.id}`);
    if (jsonBytes) {
      const factReport: IFactReport = JSON.parse(Buffer.from(jsonBytes).toString('utf8'));
      contract.connectivityScore = factReport.connectivityScore;
    }

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
    contract.date = new Date();

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
    const { web3 } = getServices();

    const { contract, speed } = action.payload;

    yield enableMetamask();
    const currentAddress = getCurrentAccountAddress();
    if (!currentAddress) {
      throw createFriendlyError(ErrorCode.VALIDATION_ERROR, 'Please select account in your wallet provider');
    }

    if (currentAddress !== contract.ispAddress && currentAddress !== contract.schoolAddress) {
      throw createFriendlyError(ErrorCode.VALIDATION_ERROR, 'You must select current contract\'s ISP or school address in your wallet provider');
    }

    const factWriter = new FactWriter(web3, contract.ispPassportAddress);
    const fact: IFactReport = {
      speed,
    };

    let factName = `${facts.ispReport}${contract.id}`;

    if (contract.schoolAddress === currentAddress) {
      factName = `${facts.schoolReport}${contract.id}`;

      // If school reports fact - precalculate connectivity score
      // We do this by taking scores from latest three days and averaging them
      yield putAndTakeAsync(loadReportingHistory, a => a.init({ contract }, { cacheTimeout: -1 }));

      const daysPassedFromContractStart = contract.date ? moment().startOf('day').diff(moment(contract.date).startOf('day'), 'days') : 0;
      const daysToCount = Math.min(3, daysPassedFromContractStart + 1);
      const factEntriesState: IAsyncState<IFactReportEntry[]> = yield select((s: IState) => s.contract.factReportingHistory[contract.id]);
      const factEntries: IFactReportEntry[] = (factEntriesState && factEntriesState.data) ? factEntriesState.data : [];
      const entriesByDate: { [date: string]: IFactReportEntry } = {};

      factEntries.forEach(e => {
        entriesByDate[moment(e.date).format('YYYY-MM-DD')] = e;
      });

      let sumScore = 0;

      // Sum scores from previous (non-today) day reports
      for (let i = 1; i < daysToCount; i += 1) {
        if (!contract.speed) {
          sumScore += 1;
          continue;
        }

        const dateToMatch = moment().subtract(i, 'days').format('YYYY-MM-DD');
        const entry = entriesByDate[dateToMatch];

        if (!entry) {
          continue;
        }

        sumScore += 1 / contract.speed * entry.schoolSpeed;
      }

      // Include today's score as well
      if (!contract.speed) {
        sumScore += 1;
      } else {
        sumScore += 1 / contract.speed * speed;
      }

      fact.connectivityScore = sumScore / daysToCount;
    }

    const jsonBytes = Array.from(Buffer.from(JSON.stringify(fact), 'utf8'));
    const txConfig = yield factWriter.setTxdata(factName, jsonBytes, currentAddress);

    const txHash = yield sendTx(txConfig);
    yield waitReceipt(txHash);

    // Reload fact history after providing fact
    yield put(loadReportingHistory.init({ contract }));

    // If we have updated connectivity score - update cached contract as well
    if (fact.connectivityScore !== null && fact.connectivityScore !== undefined) {
      const updatedContract = { ...contract };
      updatedContract.connectivityScore = fact.connectivityScore;
      yield put(loadContract.success(updatedContract, [updatedContract.id]));
    }

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
      const jsonBytes = (yield txFactReader.getTxdata(event.transactionHash)).value;
      if (!jsonBytes) {
        continue;
      }

      const factReport: IFactReport = JSON.parse(Buffer.from(jsonBytes).toString('utf8'));

      let date: Moment = yield getBlockDate(web3, event.blockNumber);
      if (!date) {
        date = moment();
      }

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
  takeEveryLatest<IAsyncAction<ILoadContractPayload>, any>(
    loadContract.request.type, a => `${a.type}_${a.payload.contractId}`, onLoadContract),
  takeEveryLatest<IAsyncAction<IContractCreatePayload>, any>(
    createContract.request.type, a => `${a.type}_${a.payload.schoolAddress}`, onCreateContract),
  takeEveryLatest<IAsyncAction<IReportFactPayload>, any>(
    reportFact.request.type, a => `${a.type}_${a.payload.contract.id}`, onReportFact),
  takeEveryLatest<IAsyncAction<ILoadReportingHistoryPayload>, any>(
    loadReportingHistory.request.type, a => `${a.type}_${a.payload.contract.id}`, onLoadReportingHistory),
];
