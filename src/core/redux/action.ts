const globalPrefix = 'mth';

// #region -------------- Interfaces -------------------------------------------------------------------

export type Path = (number | string)[];

export interface IAction<TPayload = any> {

  /**
   * Fully qualified name of action
   */
  type: string;

  /**
   * Action payload (data)
   */
  payload?: TPayload;
}

// #endregion

// #region -------------- Action creation -------------------------------------------------------------------

/**
 * Creates fully qualified action name creator
 *
 * @param moduleName - name of actions module. This will be included in action name
 */
export const getActionNameCreator = (moduleName: string) => {
  return (actionType: string) => {
    return `${globalPrefix}/${moduleName}/${actionType}`;
  };
};

/**
 * Creates simple action object
 *
 * @param actionType - fully qualified action name
 * @param payload - action payload
 */
export const createAction = <TPayload = any>(actionType: string, payload?: TPayload): IAction<TPayload> => {
  const action: IAction<TPayload> = {
    type: actionType,
    payload,
  };

  return action;
};

// #endregion
