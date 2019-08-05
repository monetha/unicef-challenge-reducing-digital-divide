import { ErrorCode } from '../ErrorCode';
import { ErrorCodeExtractor } from '../ErrorHandler';

export const connectivityErrorCodeExtractor: ErrorCodeExtractor = (error) => {

  if (error.message && error.message.indexOf('Network request failed') !== -1) {
    return ErrorCode.CONNECTIVITY_PROBLEMS;
  }

  return null;
};
