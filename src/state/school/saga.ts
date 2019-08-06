import { takeLatest, put } from 'redux-saga/effects';
import { loadSchools, loadSchool, createSchool, ICreateSchoolPayload } from './action';
import { IAsyncAction } from 'src/core/redux/asyncAction';
import { getServices } from 'src/ioc/services';
import { takeEveryLatest } from 'src/core/redux/saga';
import { ISchool } from 'src/models/school';
import { Address, FactWriter } from 'verifiable-data';
import { Country } from 'src/constants/countries';
import { getCurrentAccountAddress } from 'src/utils/metamask';
import { unicefPassportAddress } from 'src/constants/addresses';
import { sendTx, waitReceipt } from 'src/utils/tx';
import { facts } from 'src/constants/facts';

// #region -------------- Loading -------------------------------------------------------------------

function* onLoadSchools(action: IAsyncAction<void>) {
  try {
    // TODO:',
    const schools: ISchool[] = [
      {
        address: '0x123456789',
        name: `Palm tree gymnasium`,
        score: 0.5,
        country: Country.ABW,
      },
      {
        address: '0x321abc321',
        name: `Mabamonoko High`,
        score: 0.1,
        country: Country.ABW,
      },
      {
        address: '0xabcdefabcdef',
        name: `Green leaf junior`,
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

function* onCreateSchool(action: IAsyncAction<ICreateSchoolPayload>) {
  try {
    const { name, score, country, physicalAddress } = action.payload;
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

    yield put(createSchool.success(school));

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
  takeLatest(createSchool.request.type, onCreateSchool),
  takeEveryLatest<IAsyncAction<Address>, any>(
    loadSchool.request.type, a => `${a.type}_${a.payload}`, onLoadSchool),
];
