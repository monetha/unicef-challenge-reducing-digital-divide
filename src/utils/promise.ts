/**
 * convertCallbackToPromise is a helper function that converts takes callback
 * supported functions as the input with its arguments. It returns a promise that
 * gets resolves as soon as the callback function gets invoked.
 */
export const convertCallbackToPromise = async (funcWithCallback, ...funcArgs) =>
  new Promise<any>((resolve, reject) => {
    funcWithCallback(...funcArgs, (err, res) => {
      const finalErr = err || (res && res.error);

      if (finalErr) {
        reject(finalErr);
      } else {
        resolve(res && res.result || res);
      }
    });
  });
