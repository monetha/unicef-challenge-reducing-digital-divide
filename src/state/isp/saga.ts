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
import { createISP, ICreateISPPayload, loadISP, loadISPs, status } from './action';
import { CreateISPStatuses } from 'src/state/isp/reducer';

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
    const { web3 } = getServices();
    const factReader = new FactReader(web3, action.payload);
    const ownership = new PassportOwnership(web3, action.payload);

    const ownerAddress = yield ownership.getOwnerAddress();
    if (!ownerAddress) {
      throw new Error('Could not get owner of digital identity');
    }

    const jsonBytes: number[] = yield factReader.getTxdata(ownerAddress, facts.ispMetadata);
    if (!jsonBytes) {
      throw new Error('Specified address is not an ISP digital identity');
    }

    const isp: IISP = JSON.parse(Buffer.from(jsonBytes).toString('utf8'));
    isp.address = ownerAddress;
    isp.passportAddress = action.payload;

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

    yield put(status.success({
      [name]: {
        status: CreateISPStatuses.CreatingPassport,
        identityAddress: null,
      },
    }, action.subpath));

    const { web3 } = getServices();

    const ownerAddress = getCurrentAccountAddress();

    let txHash;
    let txConfig;
    let receipt;
    let passportAddress;

    const generator = new PassportGenerator(web3, passportFactoryAddress);
    txConfig = yield generator.createPassport(ownerAddress);
    console.log('generator.createPassport txConfig', txConfig);

    txHash = yield sendTx(txConfig);
    receipt = yield waitReceipt(txHash);
    console.log('generator.createPassport receipt', receipt);

    passportAddress = PassportGenerator.getPassportAddressFromReceipt(receipt);
    console.log('passportAddress', passportAddress);

    yield put(status.success({
      [name]: {
        status: CreateISPStatuses.ClaimingOwnership,
        identityAddress: passportAddress,
      },
    }, action.subpath));

    const ownership = new PassportOwnership(web3, passportAddress);
    txConfig = yield ownership.claimOwnership(ownerAddress);
    console.log('ownership.claimOwnership txConfig', txConfig);

    txHash = yield sendTx(txConfig);
    receipt = yield waitReceipt(txHash);
    console.log('ownership.claimOwnership receipt', receipt);

    const passportOwnerAddress = yield ownership.getOwnerAddress();
    console.log('passportOwnerAddress', passportOwnerAddress);

    yield put(status.success({
      [name]: {
        status: CreateISPStatuses.SubmittingMetadata,
        identityAddress: passportAddress,
      },
    }, action.subpath));

    const writer = new FactWriter(web3, passportAddress);
    const bytes = web3.utils.hexToBytes(web3.utils.toHex(JSON.stringify({
      name,
    })));
    txConfig = yield writer.setTxdata(facts.ispMetadata, bytes, ownerAddress);
    console.log('writer.setTxdata txConfig', txConfig);

    txHash = yield sendTx(txConfig);
    receipt = yield waitReceipt(txHash);
    console.log('writer.setTxdata receipt', receipt);

    yield put(status.success({
      [name]: {
        status: CreateISPStatuses.MetadataSubmitted,
        identityAddress: passportAddress,
      },
    }, action.subpath));

    const isp: IISP = {
      address: passportAddress,
      name,
      score,
    };

    yield put(createISP.success(isp, action.subpath));
  } catch (error) {
    yield put(status.success({
      [name]: null,
    }, action.subpath));

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
