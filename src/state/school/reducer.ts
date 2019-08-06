import { IAsyncState, AsyncState } from 'src/core/redux/asyncAction';
import { createReducer, ReducerBuilder } from 'src/core/redux/ReducerBuilder';
import { ISchool } from 'src/models/school';
import { loadSchools, loadSchool, status } from './action';

// #region -------------- State -------------------------------------------------------------------

export enum CreateSchoolStatuses {
  CreatingSchool = 'Creating School',
  SchoolCreated = 'School Created',
}

export interface ICreateSchoolStatus {
  [schoolName: string]: {
    status: CreateSchoolStatuses;
  };
}

export interface ISchoolState {

  /**
   * List of loaded schools
   */
  loaded: { [address: string]: IAsyncState<ISchool> };

  /**
   * Status of all School loading progress
   */
  allLoadStatus: IAsyncState<void>;

  status: IAsyncState<ICreateSchoolStatus>;
}

const initialState: ISchoolState = {
  loaded: {},
  allLoadStatus: new AsyncState(),
  status: new AsyncState(),
};

// #endregion

// #region -------------- Reducer -------------------------------------------------------------------

const builder = new ReducerBuilder<ISchoolState>()
  .addAsync(loadSchools, s => s.allLoadStatus)
  .addAsync(loadSchool, s => s.loaded, a => [a])
  .addAsync(status, s => s.status);

export const schoolReducer = createReducer(initialState, builder);

// #endregion
