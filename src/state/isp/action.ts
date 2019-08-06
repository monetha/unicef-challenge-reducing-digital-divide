import { getActionNameCreator } from 'src/core/redux/action';
import { createAsyncAction } from 'src/core/redux/asyncAction';
import { Address } from 'verifiable-data';
import { IISP } from 'src/models/isp';
import { IOwnershipClaimed, IPassportCreated } from 'src/state/isp/reducer';

// #region -------------- Action types -------------------------------------------------------------------

const get = getActionNameCreator('isp');

export const actionTypes = {
  loadISPs: get('LOAD_ALL'),
  createISP: get('CREATE_ISP'),
  identityAddress: get('IDENTITY_ADDRESS'),
  ownershipClaimed: get('OWNERSHIP_CLAIMED'),
  loadISP: get('LOAD'),
};

// #endregion

// #region -------------- ISP loading -------------------------------------------------------------------

export const loadISPs = createAsyncAction<void, void>(actionTypes.loadISPs);

export interface ICreateISPPayload {
  name: string;
  score: number;
}

export const createISP = createAsyncAction<ICreateISPPayload, IISP>(actionTypes.createISP);

export const identityAddress = createAsyncAction<IPassportCreated, IPassportCreated>(actionTypes.identityAddress);

export const ownershipClaimed = createAsyncAction<IOwnershipClaimed, IOwnershipClaimed>(actionTypes.identityAddress);

export const loadISP = createAsyncAction<Address, IISP>(actionTypes.loadISP);

// #endregion
