import { ErrorCode } from '../ErrorCode';
import { ErrorCodeExtractor } from '../ErrorHandler';

interface IRpcError {
  code?: number;
}

export const ethRpcErrorCodeExtractor: ErrorCodeExtractor = (error) => {
  const rpcError = error as IRpcError;

  if (rpcError && rpcError.code) {

    switch (rpcError.code) {
      case -32005:
        return ErrorCode.TOO_MANY_RESULTS;
      case -32600:
        return ErrorCode.INVALID_ADDRESS;
    }
  }

  return null;
};
