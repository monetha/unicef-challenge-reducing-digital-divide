import { combineReducers } from 'redux';
import { IAppState, appReducer } from './app/reducer';
import { RouterState, connectRouter } from 'connected-react-router';
import { IISPState, ispReducer } from './isp/reducer';
import { ISchoolState, schoolReducer } from './school/reducer';
import { contractReducer, IContractState } from './contract/reducer';

// #region -------------- Store interface -------------------------------------------------------------------

export interface IState {
  router: RouterState;
  app: IAppState;
  isp: IISPState;
  school: ISchoolState;
  contract: IContractState;
}

// #endregion

// #region -------------- Root reducer -------------------------------------------------------------------

export const createRootReducer = (history) => combineReducers<IState>({
  router: connectRouter(history),
  app: appReducer,
  isp: ispReducer,
  school: schoolReducer,
  contract: contractReducer,
});

// #endregion
