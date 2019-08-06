import { IAsyncState, AsyncState } from 'src/core/redux/asyncAction';
import { createReducer, ReducerBuilder } from 'src/core/redux/ReducerBuilder';
import { IISP } from 'src/models/isp';
import { loadISPs, loadISP, identityAddress, ownershipClaimed } from './action';

// #region -------------- State -------------------------------------------------------------------

export interface IPassportCreated {
  [ispName: string]: string;
}

export interface IOwnershipClaimed {
  [address: string]: boolean;
}

export interface IISPState {

  /**
   * List of loaded isps
   */
  loaded: { [address: string]: IAsyncState<IISP> };

  /**
   * Status of all ISP loading progress
   */
  allLoadStatus: IAsyncState<void>;

  /**
   * Deployed identity physicalAddress
   */
  identityAddress: IAsyncState<IPassportCreated>;

  /**
   * Identity ownership claimed
   */
  ownershipClaimed: IAsyncState<IOwnershipClaimed>;
}

const initialState: IISPState = {
  loaded: {},
  allLoadStatus: new AsyncState(),
  identityAddress: new AsyncState(),
  ownershipClaimed: new AsyncState(),
};

// #endregion

// #region -------------- Reducer -------------------------------------------------------------------

const builder = new ReducerBuilder<IISPState>()
  .addAsync(loadISPs, s => s.allLoadStatus)
  .addAsync(loadISP, s => s.loaded, a => [a])
  .addAsync(identityAddress, s => s.identityAddress)
  .addAsync(ownershipClaimed, s => s.identityAddress);

export const ispReducer = createReducer(initialState, builder);

// #endregion
