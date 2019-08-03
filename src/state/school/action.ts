import { getActionNameCreator } from 'src/core/redux/action';
import { createAsyncAction } from 'src/core/redux/asyncAction';
import { Address } from 'verifiable-data';
import { ISchool } from 'src/models/school';

// #region -------------- Action types -------------------------------------------------------------------

const get = getActionNameCreator('school');

export const actionTypes = {
  loadSchools: get('LOAD_ALL'),
  loadSchool: get('LOAD'),
};

// #endregion

// #region -------------- School loading -------------------------------------------------------------------

export const loadSchools = createAsyncAction<void, void>(actionTypes.loadSchools);

export const loadSchool = createAsyncAction<Address, ISchool>(actionTypes.loadSchool);

// #endregion
