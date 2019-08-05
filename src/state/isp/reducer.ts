import { IAsyncState, AsyncState } from 'src/core/redux/asyncAction';
import { createReducer, ReducerBuilder } from 'src/core/redux/ReducerBuilder';
import { IISP } from 'src/models/isp';
import { loadISPs, loadISP } from './action';

// #region -------------- State -------------------------------------------------------------------

export interface IISPState {

  /**
   * List of loaded isps
   */
  loaded: { [address: string]: IAsyncState<IISP> };

  /**
   * Status of all ISP loading progress
   */
  allLoadStatus: IAsyncState<void>;
}

const initialState: IISPState = {
  loaded: {},
  allLoadStatus: new AsyncState(),
};

// #endregion

// #region -------------- Reducer -------------------------------------------------------------------

const builder = new ReducerBuilder<IISPState>()
  .addAsync(loadISPs, s => s.allLoadStatus)
  .addAsync(loadISP, s => s.loaded, a => [a]);

export const ispReducer = createReducer(initialState, builder);

// #endregion
