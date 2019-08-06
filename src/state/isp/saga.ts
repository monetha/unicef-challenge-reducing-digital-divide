import { takeLatest, put } from 'redux-saga/effects';
import { loadISPs, loadISP, createISP, ICreateISPPayload, identityAddress, ownershipClaimed } from './action';
import { IAsyncAction } from 'src/core/redux/asyncAction';
import { getServices } from 'src/ioc/services';
import { takeEveryLatest } from 'src/core/redux/saga';
import { IISP } from 'src/models/isp';
import { Address, PassportGenerator, PassportOwnership, FactWriter } from 'verifiable-data';
import { getCurrentAccountAddress } from 'src/utils/metamask';
import { facts } from 'src/constants/facts';
import { sendTx, waitReceipt } from 'src/utils/tx';
import { defaultAddresses } from 'src/constants/addresses';

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

function* onCreateISP(action: IAsyncAction<ICreateISPPayload>) {
  try {
    const { name, score } = action.payload;

    const { web3 } = getServices();

    const ownerAddress = getCurrentAccountAddress();

    let txHash;
    let txConfig;
    let receipt;
    let passportAddress;

    const generator = new PassportGenerator(web3, defaultAddresses.ropsten.factory);
    txConfig = yield generator.createPassport(ownerAddress);
    console.log('generator.createPassport txConfig', txConfig);

    txHash = yield sendTx(txConfig);
    receipt = yield waitReceipt(txHash);
    console.log('generator.createPassport receipt', receipt);

    passportAddress = PassportGenerator.getPassportAddressFromReceipt(receipt);
    console.log('passportAddress', passportAddress);

    yield put(identityAddress.success({
      [name]: passportAddress,
    }, action.subpath));

    const ownership = new PassportOwnership(web3, passportAddress);
    txConfig = yield ownership.claimOwnership(ownerAddress);
    console.log('ownership.claimOwnership txConfig', txConfig);

    txHash = yield sendTx(txConfig);
    receipt = yield waitReceipt(txHash);
    console.log('ownership.claimOwnership receipt', receipt);

    yield put(ownershipClaimed.success({
      [passportAddress]: true,
    }, action.subpath));

    const passportOwnerAddress = yield ownership.getOwnerAddress();
    console.log('passportOwnerAddress', passportOwnerAddress);

    const writer = new FactWriter(web3, passportAddress);
    const bytes = web3.utils.hexToBytes(web3.utils.toHex(JSON.stringify({
      name,
    })));
    txConfig = yield writer.setTxdata(facts.ispMetadata, bytes, ownerAddress);
    console.log('writer.setTxdata txConfig', txConfig);

    txHash = yield sendTx(txConfig);
    receipt = yield waitReceipt(txHash);
    console.log('writer.setTxdata receipt', receipt);

    const isp: IISP = {
      address: passportAddress,
      name,
      score,
    };

    yield put(createISP.success(isp, action.subpath));
  } catch (error) {
    yield getServices().createErrorHandler(error)
      .onAnyError(function* (friendlyError) {
        yield put(createISP.failure(friendlyError, action.payload, action.subpath));
      })
      .process();
  }
}

// #endregion

export const ispSaga = [
  takeLatest(loadISPs.request.type, onLoadISPs),
  takeLatest(createISP.request.type, onCreateISP),
  takeEveryLatest<IAsyncAction<Address>, any>(
    loadISP.request.type, a => `${a.type}_${a.payload}`, onLoadISP),
];
