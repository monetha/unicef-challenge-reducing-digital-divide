import iassign from 'immutable-assign';
import { IAction, Path } from './action';
import { IAsyncState, IInitAction, IAsyncActionInfo, IAsyncAction, AsyncState } from './asyncAction';

// #region -------------- Types -------------------------------------------------------------------

export type ActionReducer<TState, TAction extends IAction = IAction> = (state: TState, action: TAction) => TState;

export type DataPathGetter<TRequestPayload = any> =
  (payload: TRequestPayload) => Path;

export interface IInitInternalAction<TRequestPayload = any, TError = any, TSuccessPayload = any> extends IInitAction<TRequestPayload, TError> {
  currentData: IAsyncState<TSuccessPayload, TError>;
}

class StateSubpathManagingStatus {
  public subpath: Path;
  public missingPathRemainder: Path = [];
}

// #endregion

// #region -------------- Logic builder -------------------------------------------------------------------

export class ReducerBuilder<TState> {
  private handlers: Map<string, ActionReducer<TState>[]>;

  public constructor() {
    this.handlers = new Map<string, ActionReducer<TState>[]>();
  }

  /**
   * Adds synchronious action handler. It waits for action in 'actionType' and executes 'handler'.
   * Single action can have multiple handlers registered - they are executed sequantially
   */
  public add<TAction extends IAction>(actionType: string, handler: ActionReducer<TState, TAction>): ReducerBuilder<TState> {
    if (this.handlers.has(actionType)) {
      this.handlers.get(actionType).push(handler);
      return this;
    }

    this.handlers.set(actionType, [handler]);
    return this;
  }

  /**
   * Adds async action handler. It automatically manages state for INIT, REQUEST, FAILURE, SUCCESS, INVALIDATE actions, setting flags in state such
   * as 'isFetching', 'error', 'timestamp', etc.
   * Behind the scenes, this handled adds 5 synchronious handlers.
   *
   * @param asyncAction - async action info object to handle
   * @param baseNodeSelector - a path in state where state for this async action should be stored
   * @param dataPathGetter - a getter for subpath in state, starting from 'baseNodeSelector', where data shoould be stored. Use this
   * if you want to index data by some ids and you don't know the ids in advance thus not being able to put it in 'baseNodeSelector'.
   * The subpath could be only known at run time therefore this function takes payload as a parameter and extracts needed subpath.
   */
  public addAsync<TRequestPayload, TSuccessPayload, TErrorPayload>(
    asyncAction: IAsyncActionInfo<TRequestPayload, TSuccessPayload, TErrorPayload>,
    baseNodeSelector: (state: TState) => object | IAsyncState<TSuccessPayload, TErrorPayload>,
    dataPathGetter?: DataPathGetter<TRequestPayload>): ReducerBuilder<TState> {

    const nodeSelector = (state, context) => {

      // Get state from BASE path
      let node = context.functions.baseNodeSelector(state);

      let subpath = null;

      if (context.subpath) {
        subpath = context.subpath;
      } else if (context.functions.dataPathGetter) {
        subpath = context.functions.dataPathGetter(context.payload);
      }

      if (subpath) {

        // Get state from SUB path
        node = context.functions.getSubpathedState(node, subpath, context.status, false);

        // Put subpath to state for later reference
        context.status.subpath = subpath;
      }

      return node;
    };

    const functions = {
      baseNodeSelector,
      dataPathGetter,
      getSubpathedState: this.getSubpathedState,
    };

    return this

      /**
       * INIT handler. Selects subpath from action payload and stores it into action for reducer to use.
       * Also stores existing data from state to action object in case we need to return cached data.
       */
      .add(asyncAction.init.type, (state, action: IInitInternalAction<TRequestPayload>) => {
        const status = new StateSubpathManagingStatus();

        const node = nodeSelector(state, { functions, payload: action.payload, status });

        // If we have a subpath - store it to action so it could be reused in SUCCESS, FAILURE actions
        if (status.subpath) {
          action.subpath = status.subpath;
        }

        // Path remainder is non existing state path part. If we have some remainder, it means that data we are requesting does not already
        // exist in store. In case we do not have remainder - put existing data from store to action property in case we need to return cached data.
        if (status.missingPathRemainder.length === 0) {
          action.currentData = node;
        }

        return state;
      })

      /**
       * REQUEST handler. Clears errors in state and marks data as being fetched
       */
      .add(asyncAction.request.type, (state, action: IAsyncAction<TRequestPayload>) => {
        const status = new StateSubpathManagingStatus();

        return iassign(state, nodeSelector, (o) => {
          const node = this.getSubpathedState(o, status.missingPathRemainder, status, true);

          action.subpath = status.subpath;

          node.error = null;
          node.isFetching = true;
          return o;
        },
          {
            functions,
            payload: action.payload,
            status,
            subpath: action.subpath,
          });
      })

      /**
       * SUCCESS handler. Puts data to store, clears errors and marks data as fetched
       */
      .add(asyncAction.success.type, (state, action: IAsyncAction<TSuccessPayload>) => {
        const status = new StateSubpathManagingStatus();

        // If success event was generated from cached data - no need to change anything in state
        if (action.fromCache) {
          return state;
        }

        return iassign(state, nodeSelector, (o) => {
          const node = this.getSubpathedState(o, status.missingPathRemainder, status, true);

          node.isFetched = true;
          node.isFetching = false;
          node.error = null;
          node.errorTimestamp = null;
          node.data = action.payload;
          node.timestamp = new Date();
          return o;
        },
          {
            functions,
            payload: action.payload,
            status,
            subpath: action.subpath,
          });
      })

      /**
       * ERROR handler. Puts error to store and marks data as fetched
       */
      .add(asyncAction.failure.type, (state, action: IAsyncAction<TErrorPayload>) => {
        const status = new StateSubpathManagingStatus();

        return iassign(state, nodeSelector, (o) => {
          const node = this.getSubpathedState(o, status.missingPathRemainder, status, true);

          node.isFetched = true;
          node.isFetching = false;
          node.error = action.error;
          node.errorTimestamp = new Date();
          return o;
        },
          {
            functions,
            payload: action.payload,
            status,
            subpath: action.subpath,
          });
      })

      /**
       * INVALIDATE handler. Clears timestamp in store which will allow forced data retrieval (not from cache) on the next request.
       * Also, clears error.
       */
      .add(asyncAction.invalidateData.type, (state, action: IAsyncAction<TRequestPayload>) => {
        const status = new StateSubpathManagingStatus();

        return iassign(state, nodeSelector, (o) => {
          const node = this.getSubpathedState(o, status.missingPathRemainder, status, true);

          node.timestamp = null;
          node.error = null;
          node.errorTimestamp = null;
          return o;
        },
          {
            functions,
            payload: action.payload,
            status,
            subpath: action.subpath,
          });
      });
  }

  /**
   * Return Map object for configured handlers, which maps action names to handlers. This object can be used to create reducer
   */
  public build(): Map<string, ActionReducer<TState>[]> {
    return this.handlers;
  }

  private getSubpathedState<TSuccessPayload>(
    state,
    subpath: Path,
    status: StateSubpathManagingStatus,
    createIfNotExists: boolean): AsyncState<TSuccessPayload> {

    if (!subpath || subpath.length === 0) {
      return state;
    }

    status.missingPathRemainder = subpath.slice();

    let currentNode = state;

    for (let index = 0; index < subpath.length; index += 1) {
      const pathSegment = subpath[index];

      // Path segment found
      if (pathSegment in currentNode) {
        status.missingPathRemainder.shift();
        currentNode = currentNode[pathSegment];
        continue;
      }

      // Path segment not found. If creation is disabled - end iteration here
      if (!createIfNotExists) {
        break;
      }

      // Last element? If yes, then it must be AsyncState object
      if (index === subpath.length - 1) {
        currentNode[pathSegment] = new AsyncState<TSuccessPayload>(null);
      } else {
        currentNode[pathSegment] = {};
      }

      status.missingPathRemainder.shift();
      currentNode = currentNode[pathSegment];
    }

    return currentNode;
  }
}

// #endregion

// #region -------------- Reducer creation -------------------------------------------------------------------

export function createReducer<T>(initialState: T, reducerBuilder: ReducerBuilder<T>) {
  const handlers = reducerBuilder.build();

  return (state = initialState, action: IAction) => {
    if (!handlers.has(action.type)) {
      return state;
    }

    const handlerFuncs: any[] = handlers.get(action.type);

    let modifiedState = state;
    handlerFuncs.forEach(handlerFunc => {
      modifiedState = handlerFunc(modifiedState, action);
    });

    return modifiedState;
  };
}

export function getInitialState<T>(state: T): T {
  return iassign(state, (o) => o) as T;
}

// #endregion
