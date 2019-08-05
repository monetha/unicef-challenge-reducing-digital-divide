import moment from 'moment';
import { put, takeLatest } from 'redux-saga/effects';
import { IInitInternalAction } from './ReducerBuilder';
import { IAsyncAction, createAsyncAction, AsyncActionSubtype } from './asyncAction';

/**
 * This saga catches async actions with 'init' subtype and dispatches REQUEST or SUCCESS event depending
 * on whether data in store is already cached, or not (expired)
 * This saga works together with reducerBuilder
 */
function* onInitAction(action: IInitInternalAction) {

  // Already fetching the data? Do nothing
  if (action.currentData && action.currentData.isFetching) {
    return;
  }

  let needsFetching = false;

  let timeout = action.cacheTimeout;
  if (!(timeout >= 0 || timeout < 0)) {
    timeout = 0;
  }

  // No data, error occurred or timeout is zero? Needs fetching
  if (!action.currentData || !action.currentData.timestamp || action.currentData.error || timeout === 0) {
    needsFetching = true;

    // Timeout is non negative and time since last fetch is more than timeout? Needs fetching
  } else if (timeout >= 0 && moment().diff(action.currentData.timestamp, 'seconds') >= timeout) {
    needsFetching = true;
  }

  const baseTypeName = action.type.substring(0, action.type.length - 5);

  const asyncAction = createAsyncAction(baseTypeName);

  if (needsFetching) {

    // Needs fetching. Dispatch REQUEST
    yield put(asyncAction.request(action.payload, action.subpath));
  } else {

    // Data is already in store. Dispatch SUCCESS, but mark it with "fromCache" so that
    // success reducer would not update data updated timestamp in state
    const successAction: IAsyncAction = asyncAction.success(action.currentData.data, action.subpath);
    successAction.fromCache = true;

    yield put(successAction);
  }
}

export const asyncActionSagas = [
  takeLatest((action: IAsyncAction) => action.subtype === AsyncActionSubtype.Init, onInitAction),
];
