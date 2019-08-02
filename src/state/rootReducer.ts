import { combineReducers } from 'redux';
import { IAppState, appReducer } from './app/reducer';
import { RouterState, connectRouter } from 'connected-react-router';

// #region -------------- Store interface -------------------------------------------------------------------

export interface IState {
  router: RouterState;
  app: IAppState;
}

// #endregion

// #region -------------- Root reducer -------------------------------------------------------------------

export const createRootReducer = (history) => combineReducers<IState>({
  router: connectRouter(history),
  app: appReducer,
});

// #endregion
