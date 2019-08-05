
import { routerMiddleware } from 'connected-react-router';
import { applyMiddleware, createStore, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import { createRootReducer, IState } from './rootReducer';
import { rootSaga } from './rootSaga';

export const bootstrapRedux = (initialState: Partial<IState> = {}, history): Store<IState> => {
  const middlewares = [];

  // Saga middleware
  const sagaMiddleware = createSagaMiddleware();
  middlewares.push(sagaMiddleware);

  // Router middleware
  middlewares.push(routerMiddleware(history));

  const store = createStore(
    createRootReducer(history),
    initialState,

    // React native dev tools middleware
    composeWithDevTools(applyMiddleware(...middlewares)),
  );

  sagaMiddleware.run(rootSaga);

  return store;
};
