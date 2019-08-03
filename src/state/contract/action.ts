import { getActionNameCreator } from 'src/core/redux/action';
import { createAsyncAction } from 'src/core/redux/asyncAction';
import { IContract } from 'src/models/contract';

// #region -------------- Action types -------------------------------------------------------------------

const get = getActionNameCreator('contract');

export const actionTypes = {
  loadContracts: get('LOAD_ALL'),
  loadContract: get('LOAD'),
};

// #endregion

// #region -------------- Contract loading -------------------------------------------------------------------

export const loadContracts = createAsyncAction<void, void>(actionTypes.loadContracts);

export const loadContract = createAsyncAction<string, IContract>(actionTypes.loadContract);

// #endregion
