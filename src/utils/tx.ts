import { getServices } from 'src/ioc/services';
import { TransactionConfig, TransactionReceipt } from 'web3-core';
import { enableMetamask, sendTransaction } from './metamask';

export async function sendTx(txConfig: TransactionConfig) {
  await enableMetamask();

  return sendTransaction(txConfig);
}

/**
 * waitReceipt waits for transaction to finish for the given txHash,
 * returns a promise which is resolved when transaction finishes.
 * @param {string} txHash a string with transaction hash as value
 */
export const waitReceipt = (txHash: string): Promise<TransactionReceipt> =>
  new Promise((resolve, reject) => {
    const { web3 } = getServices();

    const waiter = async () => {
      try {
        const receipt = await web3.eth.getTransactionReceipt(txHash);

        if (receipt) {
          if (!receipt.status) {
            console.error(receipt);
            throw new Error('Transaction has failed');
          }

          resolve(receipt);
          return;
        }
      } catch (err) {
        reject(err);
        return;
      }

      setTimeout(waiter, 1000);
    };

    waiter();
  });
