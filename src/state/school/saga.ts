import { put, takeLatest } from 'redux-saga/effects';
import { unicefPassportAddress } from 'src/constants/addresses';
import { facts } from 'src/constants/facts';
import { IAsyncAction } from 'src/core/redux/asyncAction';
import { takeEveryLatest } from 'src/core/redux/saga';
import { getServices } from 'src/ioc/services';
import { ISchool } from 'src/models/school';
import { Address, FactReader, IHistoryEvent, PassportReader, FactWriter } from 'verifiable-data';
import { loadSchool, loadSchools, createSchool, status } from './action';
import { getCurrentAccountAddress } from 'src/utils/metamask';
import { Country } from 'src/constants/countries';
import { sendTx, waitReceipt } from 'src/utils/tx';
import { ICreateSchoolPayload } from 'src/state/school/action';
import { CreateSchoolStatuses } from 'src/state/school/reducer';

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

function* onCreateSchool(action: IAsyncAction<ICreateSchoolPayload>) {
  try {
    const { name, score, country, physicalAddress } = action.payload;
    yield put(status.success({
      [name]: {
        status: CreateSchoolStatuses.CreatingSchool,
      },
    }, action.subpath));
    const { web3 } = getServices();

    const ownerAddress = getCurrentAccountAddress();

    let txHash;
    let txConfig;
    let receipt;

    const school: ISchool = {
      name,
      country: country as Country,
      score,
    };

    const writer = new FactWriter(web3, unicefPassportAddress);
    const bytes = web3.utils.hexToBytes(web3.utils.toHex(JSON.stringify({
      ...school,
      physicalAddress,
    })));
    txConfig = yield writer.setTxdata(facts.schoolMetadata, bytes, ownerAddress);
    console.log('writer.setTxdata txConfig', txConfig);

    txHash = yield sendTx(txConfig);
    receipt = yield waitReceipt(txHash);
    console.log('writer.setTxdata receipt', receipt);

    yield put(status.success({
      [name]: {
        status: CreateSchoolStatuses.SchoolCreated,
      },
    }, action.subpath));

    yield put(createSchool.success(school));

  } catch (error) {
    yield put(status.success({
      [name]: null,
    }, action.subpath));

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
  takeLatest(createSchool.request.type, onCreateSchool),
  takeEveryLatest<IAsyncAction<Address>, any>(
    loadSchool.request.type, a => `${a.type}_${a.payload}`, onLoadSchool),
];
