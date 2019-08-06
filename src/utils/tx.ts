import { TransactionConfig, TransactionReceipt } from 'web3-core';
import { enableMetamask, sendTransaction, getMetamaskEthereumInstance } from './metamask';
import { convertCallbackToPromise } from './promise';

export async function sendTx(txConfig: TransactionConfig) {
  await enableMetamask();

  return sendTransaction(txConfig);
}

/**
 * waitReceipt waits for transaction to finish for the given txHash,
 * returns a promise which is resolved when transaction finishes.
 * @param {string} txHash a string with transaction hash as value
 */
export const waitReceipt = async (txHash: string): Promise<TransactionReceipt> => {
  const ethereum = getMetamaskEthereumInstance();

  for (let i = 0; i < 50; i += 1) {
    const receipt: TransactionReceipt = await convertCallbackToPromise(
      ethereum.sendAsync,
      {
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });

    if (!receipt) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      continue;
    }

    if (!receipt.status) {
      console.error(receipt);
      throw new Error('Transaction has failed');
    }

    return receipt;
  }

  throw new Error('Failed to get receipt after 50 retries');
};
