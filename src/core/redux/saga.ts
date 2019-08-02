
import { put, take, all, call, fork, cancel, ActionPattern } from 'redux-saga/effects';
import { IAsyncActionInfo, IAsyncAction } from './asyncAction';
import { Action } from 'redux';
import { Task } from 'redux-saga';

// #region -------------- putAndTakeAsync helper -------------------------------------------------------------------

export type RequestActionCreator<TRequestPayload, TSuccessPayload> =
  (asyncAction: IAsyncActionInfo<TRequestPayload, TSuccessPayload>) => IAsyncAction<TRequestPayload>;

/**
 * This helper dispatches specified action and waits until success or fail action
 * On success - success action object is returned. Otherwise failure action object
 * is thrown
 */
export function putAndTakeAsync<TRequestPayload, TSuccessPayload = any>(
  asyncAction: IAsyncActionInfo<TRequestPayload, TSuccessPayload>,
  requestActionCreator: RequestActionCreator<TRequestPayload, TSuccessPayload>) {

  return call(putAndTakeAsyncSaga, asyncAction, requestActionCreator(asyncAction));
}

function* putAndTakeAsyncSaga<TRequestPayload, TSuccessPayload>(
  asyncAction: IAsyncActionInfo<TRequestPayload, TSuccessPayload>,
  requestAction: IAsyncAction<TRequestPayload>) {

  const [, actionResult] = yield all([
    put(requestAction),
    take([asyncAction.failure.type, asyncAction.success.type]),
  ]);

  if (actionResult.type === asyncAction.failure.type) {
    throw actionResult;
  }

  return actionResult;
}

// #endregion

// #region -------------- takeEveryLatest -------------------------------------------------------------------

export type ActionNameCreator<TAction extends Action> = (action: TAction) => string;

/**
 * Takes every action in pattern, creates id for the task using action info and ensures thats
 * only latest task with the same id is run. Good if you want to run task for example every "UPDATED_PRODUCT" action, but
 * only 1 task per product ID
 * @param pattern - common pattern to match
 * @param taskIdCreator - unique task ID creation function using action
 * @param saga - saga to run
 * @param args - optional arguments for saga
 */
export const takeEveryLatest = <
  TAction extends Action,
  P extends ActionPattern
>(
  pattern: P,
  taskIdCreator: ActionNameCreator<TAction>,
  saga,
  ...args) => fork(function* () {

    const tasksByIds: {[id: string]: Task} = {};

    while (true) {
      const action = yield take(pattern);

      const taskId = taskIdCreator(action);

      if (tasksByIds[taskId]) {
        const task = tasksByIds[taskId];
        yield cancel(task);
      }

      tasksByIds[taskId] = yield fork(saga, ...args.concat(action));

      // Cleanup - clear hash map when task finished running
      tasksByIds[taskId].toPromise()
        .then(() => {
          const task = tasksByIds[taskId];
          if (task.isRunning()) {
            return;
          }

          delete tasksByIds[taskId];
        });
    }
  });

// #endregion
