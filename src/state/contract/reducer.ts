import { IAsyncState, AsyncState } from 'src/core/redux/asyncAction';
import { createReducer, ReducerBuilder } from 'src/core/redux/ReducerBuilder';
import { IContract } from 'src/models/contract';
import { loadContracts, loadContract } from './action';

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
}

const initialState: IContractState = {
  loaded: {},
  allLoadStatus: new AsyncState(),
};

// #endregion

// #region -------------- Reducer -------------------------------------------------------------------

const builder = new ReducerBuilder<IContractState>()
  .addAsync(loadContracts, s => s.allLoadStatus)
  .addAsync(loadContract, s => s.loaded, a => [a]);

export const contractReducer = createReducer(initialState, builder);

// #endregion
