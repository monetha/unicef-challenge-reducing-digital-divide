import { createFriendlyError } from 'src/core/error/FriendlyError';
import { ErrorCode } from 'src/core/error/ErrorCode';

/**
 * cbToPromise is a helper function that executes callback invoking function and returns a promise that
 * gets resolves as soon as the callback function gets invoked.
 */
export const cbToPromise = async <TResult>(fnExecutor: (callback) => any) => {
  return new Promise<TResult>((resolve, reject) => {
    const callback = (err, res) => {
      let finalErr = (res && res.error) || err;

      if (finalErr) {
        if (typeof finalErr === 'string') {
          finalErr = createFriendlyError(ErrorCode.UNKNOWN, finalErr);
        }

        reject(finalErr);
      } else {
        resolve(res && res.result);
      }
    };

    fnExecutor(callback);
  });
};
