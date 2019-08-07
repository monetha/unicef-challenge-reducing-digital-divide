import iassign from 'immutable-assign';
import { AsyncState, IAsyncState } from 'src/core/redux/asyncAction';
import { createReducer, ReducerBuilder } from 'src/core/redux/ReducerBuilder';
import { IISP } from 'src/models/isp';
import { actionTypes, createISP, loadISP, loadISPs } from './action';

// #region -------------- State -------------------------------------------------------------------

export enum CreateISPStatuses {
  CreatingPassport = 'Creating Passport',
  ClaimingOwnership = 'Claiming Ownership',
  SubmittingMetadata = 'Submitting Metadata',
  MetadataSubmitted = 'Metadata Submitted',
}

export interface ICreateISPStatus {
  status: CreateISPStatuses;
  identityAddress?: string;
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

  creationStatus: IAsyncState<void>;
  creationProgress: ICreateISPStatus;
}

const initialState: IISPState = {
  loaded: {},
  allLoadStatus: new AsyncState(),
  creationStatus: new AsyncState(),
  creationProgress: null,
};

// #endregion

// #region -------------- Reducer -------------------------------------------------------------------

const builder = new ReducerBuilder<IISPState>()
  .addAsync(loadISPs, s => s.allLoadStatus)
  .addAsync(loadISP, s => s.loaded, a => [a])
  .addAsync(createISP, s => s.creationStatus)
  .add(actionTypes.updateISPCreationStatus, (state, action) => {
    return iassign(state, s => s, node => {
      node.creationProgress = action.payload;
      return node;
    });
  });

export const ispReducer = createReducer(initialState, builder);

// #endregion
