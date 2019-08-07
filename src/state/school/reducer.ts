import { AsyncState, IAsyncState } from 'src/core/redux/asyncAction';
import { createReducer, ReducerBuilder } from 'src/core/redux/ReducerBuilder';
import { ISchool } from 'src/models/school';
import { loadSchool, loadSchools, createSchool } from './action';

// #region -------------- State -------------------------------------------------------------------

export interface ISchoolState {

  /**
   * List of loaded schools
   */
  loaded: { [address: string]: IAsyncState<ISchool> };

  /**
   * Status of all School loading progress
   */
  allLoadStatus: IAsyncState<void>;

  creationStatus: IAsyncState<void>;
}

const initialState: ISchoolState = {
  loaded: {},
  allLoadStatus: new AsyncState(),
  creationStatus: new AsyncState(),
};

// #endregion

// #region -------------- Reducer -------------------------------------------------------------------

const builder = new ReducerBuilder<ISchoolState>()
  .addAsync(loadSchools, s => s.allLoadStatus)
  .addAsync(loadSchool, s => s.loaded, a => [a])
  .addAsync(createSchool, s => s.creationStatus);

export const schoolReducer = createReducer(initialState, builder);

// #endregion
