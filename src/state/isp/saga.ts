import { takeLatest, put } from 'redux-saga/effects';
import { loadISPs, loadISP, createISP, ICreateISPPayload } from './action';
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

    const generator = new PassportGenerator(web3, defaultAddresses.ganache.factory);
    let txConfig = yield generator.createPassport(ownerAddress);
    console.log('generator.createPassport txConfig', txConfig);

    let txHash = yield sendTx(txConfig);
    let receipt = yield waitReceipt(txHash);
    // const receipt = yield web3.eth.sendTransaction(txConfig);
    console.log('generator.createPassport receipt', receipt);

    const passportAddress = PassportGenerator.getPassportAddressFromReceipt(receipt);
    console.log('passportAddress', passportAddress);
    // const passportAddress = '0x50a75508b05cec65c6f4b8d320c6f87863c45ce8';

    const ownership = new PassportOwnership(web3, passportAddress);
    txConfig = yield ownership.claimOwnership(ownerAddress);
    console.log('ownership.claimOwnership txConfig', txConfig);

    txHash = yield sendTx(txConfig);
    receipt = yield waitReceipt(txHash);
    console.log('ownership.claimOwnership receipt', receipt);

    const passportOwnerAddress = yield ownership.getOwnerAddress();
    console.log('passportOwnerAddress', passportOwnerAddress);

    const writer = new FactWriter(web3, passportAddress);
    const bytes = web3.utils.hexToBytes(web3.utils.toHex(JSON.stringify({
      name,
    })));
    txConfig = yield writer.setTxdata(facts.contractMetadata, bytes, ownerAddress);
    console.log('writer.setTxdata txConfig', txConfig);

    txHash = yield sendTx(txConfig);
    receipt = yield waitReceipt(txHash);
    console.log('writer.setTxdata receipt', receipt);

    const isp: IISP = {
      address: '0x0',
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
