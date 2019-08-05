import { ErrorCode } from './ErrorCode';

export interface IFriendlyError extends Error {
  errorCode: ErrorCode;
  friendlyMessage: string;
}

/**
 * Creates friendly error or augments existing error with UI friendly info like UI-friendly message and known error code
 */
export function createFriendlyError(code: ErrorCode, friendlyMessage: string, rawError?: Error): IFriendlyError {
  let error: Partial<IFriendlyError> = rawError;
  if (!error) {
    error = new Error(friendlyMessage);
  }

  error.errorCode = code;
  error.friendlyMessage = friendlyMessage;

  return error as IFriendlyError;
}
