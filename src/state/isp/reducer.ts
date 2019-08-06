import { IAsyncState, AsyncState } from 'src/core/redux/asyncAction';
import { createReducer, ReducerBuilder } from 'src/core/redux/ReducerBuilder';
import { IISP } from 'src/models/isp';
import { loadISPs, loadISP, status } from './action';

// #region -------------- State -------------------------------------------------------------------

export enum CreateISPStatuses {
  CreatingPassport = 'Creating Passport',
  ClaimingOwnership = 'Claiming Ownership',
  SubmittingMetadata = 'Submitting Metadata',
  MetadataSubmitted = 'Metadata Submitted',
}

export interface ICreateISPStatus {
  [ispName: string]: {
    status: CreateISPStatuses;
    identityAddress?: string;
  };
}

export interface IISPState {

  /**
   * List of loaded isps
   */
  loaded: { [address: string]: IAsyncState<IISP> };

  /**
   * CreateISPStatuses of all ISP loading progress
   */
  allLoadStatus: IAsyncState<void>;

  status: IAsyncState<ICreateISPStatus>;
}

const initialState: IISPState = {
  loaded: {},
  allLoadStatus: new AsyncState(),
  status: new AsyncState(),
};

// #endregion

// #region -------------- Reducer -------------------------------------------------------------------

const builder = new ReducerBuilder<IISPState>()
  .addAsync(loadISPs, s => s.allLoadStatus)
  .addAsync(loadISP, s => s.loaded, a => [a])
  .addAsync(status, s => s.status);

export const ispReducer = createReducer(initialState, builder);

// #endregion
