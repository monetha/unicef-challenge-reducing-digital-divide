import { put, takeLatest } from 'redux-saga/effects';
import { passportFactoryAddress } from 'src/constants/addresses';
import { facts } from 'src/constants/facts';
import { IAsyncAction } from 'src/core/redux/asyncAction';
import { takeEveryLatest } from 'src/core/redux/saga';
import { getServices } from 'src/ioc/services';
import { IISP } from 'src/models/isp';
import { getCurrentAccountAddress } from 'src/utils/metamask';
import { sendTx, waitReceipt } from 'src/utils/tx';
import { Address, FactReader, FactWriter, IPassportRef, PassportGenerator, PassportOwnership, PassportReader } from 'verifiable-data';
import { createISP, ICreateISPPayload, loadISP, loadISPs } from './action';

// #region -------------- Loading -------------------------------------------------------------------

function* onLoadISPs(action: IAsyncAction<void>) {
  try {
    const { web3 } = getServices();
    const passReader = new PassportReader(web3);

    const allPassports: IPassportRef[] = yield passReader.getPassportsList(passportFactoryAddress);

    for (const passport of allPassports) {
      const factReader = new FactReader(web3, passport.address);

      const jsonBytes: number[] = yield factReader.getTxdata(passport.ownerAddress, facts.ispMetadata);
      if (!jsonBytes) {
        continue;
      }

      const isp: IISP = JSON.parse(Buffer.from(jsonBytes).toString('utf8'));
      isp.address = passport.ownerAddress;
      isp.passportAddress = passport.address;

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

    const generator = new PassportGenerator(web3, passportFactoryAddress);
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
