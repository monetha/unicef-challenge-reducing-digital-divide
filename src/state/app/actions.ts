import { getActionNameCreator, createAction } from 'src/core/redux/action';

// #region -------------- Action types -------------------------------------------------------------------

const get = getActionNameCreator('app');

export const actionTypes = {
  appBootsrapped: get('APP_BOOTSTRAPPED'),
};

// #endregion

// #region -------------- Actions -------------------------------------------------------------------

export const appBootstrapped = () => createAction(actionTypes.appBootsrapped);

// #endregion
