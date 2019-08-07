import { IAsyncState, AsyncState } from 'src/core/redux/asyncAction';
import { createReducer, ReducerBuilder } from 'src/core/redux/ReducerBuilder';
import { IContract, IFactReportEntry } from 'src/models/contract';
import { loadContracts, loadContract, createContract, reportFact, loadReportingHistory } from './action';

// #region -------------- State -------------------------------------------------------------------

export interface IContractState {

  /**
   * List of loaded contracts
   */
  loaded: { [id: string]: IAsyncState<IContract> };

  /**
   * Status of all Contract loading progress
   */
  allLoadStatus: IAsyncState<void>;

  creationStatus: { [schoolAddress: string]: IAsyncState<void> };
  factReportingStatus: { [contractId: string]: IAsyncState<void> };
  factReportingHistory: { [contractId: string]: IAsyncState<IFactReportEntry[]> };
}

const initialState: IContractState = {
  loaded: {},
  allLoadStatus: new AsyncState(),
  creationStatus: {},
  factReportingStatus: {},
  factReportingHistory: {},
};

// #endregion

// #region -------------- Reducer -------------------------------------------------------------------

const builder = new ReducerBuilder<IContractState>()
  .addAsync(loadContracts, s => s.allLoadStatus)
  .addAsync(loadContract, s => s.loaded, a => [a.contractId])
  .addAsync(createContract, s => s.creationStatus, a => [a.schoolAddress])
  .addAsync(reportFact, s => s.factReportingStatus, a => [a.contract.id])
  .addAsync(loadReportingHistory, s => s.factReportingHistory, a => [a.contract.id]);

export const contractReducer = createReducer(initialState, builder);

// #endregion
