import { IFriendlyError } from '../error/FriendlyError';
import { IAction, Path, createAction } from './action';

// #region -------------- Types -------------------------------------------------------------------

export enum AsyncActionSubtype {
  Init = 'init',
  Request = 'request',
  Success = 'success',
  Failure = 'failure',
  Invalidate = 'invalidate',
}

export interface IAsyncAction<TPayload = any, TError = IFriendlyError> extends IAction<TPayload> {

  /**
   * Indicates subtype of async action
   */
  subtype?: AsyncActionSubtype;

  /**
   * Contains error in case action carries information about error.
   */
  error?: TError;

  /**
   * Indicates whether action payload is returned from cache.
   */
  fromCache?: boolean;

  /**
   * Indicates path in state, where action data should be put.
   */
  subpath?: Path;
}

export interface IInitAction<TPayload, TError = IFriendlyError> extends IAsyncAction<TPayload, TError> {

  /**
   * A timeout until which data will not be retrieved again if requested using INIT.
   * Use -1 to always retrieve from cache.
   * If not passed or 0 passed - cache will not be ignored and request will be made.
   */
  cacheTimeout?: number;
}

export interface IAsyncActionInfo<TRequestPayload = any, TSuccessPayload = any, TErrorPayload = any, TError = IFriendlyError> {
  init: IInitActionCreator<TRequestPayload>;
  request: IActionCreator<TRequestPayload>;
  success: IActionCreator<TSuccessPayload>;
  failure: IErrorActionCreator<TError, TErrorPayload>;
  invalidateData: IActionCreator<TRequestPayload>;
}

interface IInitActionCreator<TPayload, TAction = IInitAction<TPayload, any>> {
  (payload?: TPayload, cacheOptions?: ICacheOptions): TAction;

  type: string;
}

interface IActionCreator<TPayload, TAction = IAsyncAction> {
  (payload?: TPayload, subpath?: Path): TAction;

  type: string;
}

interface IErrorActionCreator<TError, TPayload> {
  (error?: TError, payload?: TPayload, subpath?: Path): IAsyncAction<TPayload, TError>;

  type: string;
}

interface ICacheOptions {
  cacheTimeout?: number;
}

// #endregion

// #region -------------- Async state -------------------------------------------------------------------

/**
 * Async state object which holds information about non-synchroinous operations
 */
export interface IAsyncState<TData, TError = IFriendlyError> {
  data: TData;
  isFetching: boolean;
  isFetched: boolean;
  error: TError;
  errorTimestamp: Date;
  timestamp: Date;
}

export class AsyncState<TData, TError = IFriendlyError> implements IAsyncState<TData, TError> {
  public data: TData = null;
  public error: TError = null;
  public errorTimestamp: Date = null;
  public isFetching = false;
  public isFetched = false;
  public timestamp: Date = null;

  constructor(initialData?: TData, setFetchedState: boolean = false) {
    this.data = initialData;

    if (setFetchedState) {
      this.isFetched = true;
      this.timestamp = new Date();
    }
  }
}

// #endregion

// #region -------------- Async action creation -------------------------------------------------------------------

export function createAsyncAction<TRequestPayload = any, TSuccessPayload = any, TErrorPayload = any, TError = IFriendlyError>(actionType: string):
  IAsyncActionInfo<TRequestPayload, TSuccessPayload, TErrorPayload, TError> {

  const init = getInitActionCreator<TRequestPayload>(`${actionType}_INIT`);
  const request = getActionCreator<TRequestPayload>(`${actionType}_REQUEST`, AsyncActionSubtype.Request);
  const success = getActionCreator<TSuccessPayload>(`${actionType}_SUCCESS`, AsyncActionSubtype.Success);
  const failure = getFailureActionCreator<TErrorPayload, TError>(`${actionType}_FAILURE`);
  const invalidateData = getActionCreator<TRequestPayload>(`${actionType}_INVALIDATE_DATA`, AsyncActionSubtype.Invalidate);

  return {
    init,
    request,
    success,
    failure,
    invalidateData,
  };
}

function getInitActionCreator<TPayload>(fullActionType: string): IInitActionCreator<TPayload> {
  const creator: IInitActionCreator<TPayload> = ((payload?: TPayload, cacheOptions?: ICacheOptions) => {

    const action = createAction<TPayload>(
      fullActionType,
      payload,
    ) as IInitAction<TPayload, any>;

    if (cacheOptions) {
      action.cacheTimeout = cacheOptions.cacheTimeout;
    }

    action.subtype = AsyncActionSubtype.Init;

    return action;
  }) as IInitActionCreator<TPayload>;

  creator.type = fullActionType;

  return creator;
}

function getActionCreator<TPayload>(fullActionType: string, actionSubtype: AsyncActionSubtype): IActionCreator<TPayload> {
  const creator = ((payload?: TPayload, subpath?: Path) => {

    const action = createAction(
      fullActionType,
      payload,
    ) as IAsyncAction;

    action.subpath = subpath;
    action.subtype = actionSubtype;

    return action;
  }) as IActionCreator<TPayload>;

  creator.type = fullActionType;

  return creator;
}

function getFailureActionCreator<TPayload, TError>(fullActionType: string): IErrorActionCreator<TError, TPayload> {
  const creator: IErrorActionCreator<TError, TPayload> = ((error?: TError, payload?: TPayload, subpath?: Path) => {

    const action = createAction<TPayload>(
      fullActionType,
      payload,
    ) as IAsyncAction<TPayload, TError>;

    action.subpath = subpath;
    action.error = error;
    action.subtype = AsyncActionSubtype.Failure;

    return action;
  }) as IErrorActionCreator<TError, TPayload>;

  creator.type = fullActionType;

  return creator;
}

// #endregion
