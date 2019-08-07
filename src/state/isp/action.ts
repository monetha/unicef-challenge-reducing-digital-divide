import { getActionNameCreator, createAction } from 'src/core/redux/action';
import { createAsyncAction } from 'src/core/redux/asyncAction';
import { Address } from 'verifiable-data';
import { IISP } from 'src/models/isp';
import { ICreateISPStatus } from 'src/state/isp/reducer';

// #region -------------- Action types -------------------------------------------------------------------

const get = getActionNameCreator('isp');

export const actionTypes = {
  loadISPs: get('LOAD_ALL'),
  loadISP: get('LOAD'),
  createISP: get('CREATE_ISP'),
  updateISPCreationStatus: get('UPDATE_CREATION_STATUS'),
};

// #endregion

// #region -------------- ISP loading -------------------------------------------------------------------

export const loadISPs = createAsyncAction<void, void>(actionTypes.loadISPs);

export const loadISP = createAsyncAction<Address, IISP>(actionTypes.loadISP);

// #endregion

// #region -------------- ISP creation -------------------------------------------------------------------

export interface ICreateISPPayload {
  name: string;
  score: number;
}

export const createISP = createAsyncAction<ICreateISPPayload, IISP>(actionTypes.createISP);

export const updateISPCreationStatus = (newStatus: ICreateISPStatus) =>
  createAction(actionTypes.updateISPCreationStatus, newStatus);

// #endregion
