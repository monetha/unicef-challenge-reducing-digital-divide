import { getActionNameCreator } from 'src/core/redux/action';
import { createAsyncAction } from 'src/core/redux/asyncAction';
import { IContract, IFactReportEntry } from 'src/models/contract';
import { Address } from 'verifiable-data';

// #region -------------- Action types -------------------------------------------------------------------

const get = getActionNameCreator('contract');

export const actionTypes = {
  loadContracts: get('LOAD_ALL'),
  loadContract: get('LOAD'),
  createContract: get('CREATE_CONTRACT'),
  reportFact: get('REPORT_FACT'),
  loadReportingHistory: get('LOAD_REPORTING_HISTORY'),
};

// #endregion

// #region -------------- Contract loading -------------------------------------------------------------------

export const loadContracts = createAsyncAction<void, void>(actionTypes.loadContracts);

export interface ILoadContractPayload {
  contractId: string;
  ispPassportAddress: Address;
  schoolAddress: Address;
}

export const loadContract = createAsyncAction<ILoadContractPayload, IContract>(actionTypes.loadContract);

// #endregion

// #region -------------- Contract creation -------------------------------------------------------------------

export interface IContractCreatePayload {
  schoolAddress: Address;
  ispPassportAddress: Address;
  speed: number;
}

export const createContract = createAsyncAction<IContractCreatePayload, void>(actionTypes.createContract);

// #endregion

// #region -------------- Fact reporting -------------------------------------------------------------------

export interface IReportFactPayload {
  contract: IContract;
  speed: number;
}

export const reportFact = createAsyncAction<IReportFactPayload, void>(actionTypes.reportFact);

export interface ILoadReportingHistoryPayload {
  contract: IContract;
}

export const loadReportingHistory = createAsyncAction<ILoadReportingHistoryPayload, IFactReportEntry[]>(actionTypes.loadReportingHistory);

// #endregion
