import iassign from 'immutable-assign';
import { ReducerBuilder, createReducer } from 'src/core/redux/ReducerBuilder';
import { actionTypes } from './actions';

// #region -------------- State -------------------------------------------------------------------

export interface IAppState {
  isBootstrapped: boolean;
}

const initialState: IAppState = {
  isBootstrapped: false,
};

// #endregion

// #region -------------- Reducer -------------------------------------------------------------------

const builder = new ReducerBuilder<IAppState>()
  .add(actionTypes.appBootsrapped, (state) => {
    return iassign(state, s => s, node => {
      node.isBootstrapped = true;
      return node;
    });
  });

export const appReducer = createReducer(initialState, builder);

// #endregion
