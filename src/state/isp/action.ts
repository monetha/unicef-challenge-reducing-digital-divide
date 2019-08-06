import { getActionNameCreator } from 'src/core/redux/action';
import { createAsyncAction } from 'src/core/redux/asyncAction';
import { Address } from 'verifiable-data';
import { IISP } from 'src/models/isp';

// #region -------------- Action types -------------------------------------------------------------------

const get = getActionNameCreator('isp');

export const actionTypes = {
  loadISPs: get('LOAD_ALL'),
  createISP: get('CREATE_ISP'),
  loadISP: get('LOAD'),
};

// #endregion

// #region -------------- ISP loading -------------------------------------------------------------------

export const loadISPs = createAsyncAction<void, void>(actionTypes.loadISPs);

export interface ICreateISPPayload {
  name: string;
  score: number;
};

export const createISP = createAsyncAction<ICreateISPPayload, IISP>(actionTypes.createISP);

export const loadISP = createAsyncAction<Address, IISP>(actionTypes.loadISP);

// #endregion
