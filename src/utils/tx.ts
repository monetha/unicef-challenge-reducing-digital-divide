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
    const { web3 } = window as any;
    const cb = () => web3.eth.getTransactionReceipt(txHash, waiter);
    const waiter = (error, receipt) => {
      if (error) {
        reject(error);
        return;
      }

      if (!receipt) {
        setTimeout(cb, 1000);
        return;
      }

      if (!receipt.status) {
        console.error(receipt);
        reject('Transaction has failed');
        return;
      }

      setTimeout(() => resolve(receipt), 10000);
    };

    cb();
  });
