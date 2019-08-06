import { TransactionConfig } from 'web3-core';
import { toHex } from './convert';
import { convertCallbackToPromise } from './promise';

/**
 * Enables metamask usage so it can be used or throws error otherwise
 */
export const enableMetamask = async () => {
  const ethereum = getMetamaskEthereumInstance();
  if (!ethereum) {
    throw new Error('Please install metamask chrome extension');
  }

  try {
    const [currentAddress] = await ethereum.enable();
    if (!currentAddress) {
      throw new Error('Unknown reason');
    }
  } catch (e) {
    console.error(e);

    let msg;
    if (typeof e === 'string') {
      msg = e;
    } else {
      msg = e.message;
    }

    throw new Error(`Could not enable metamask: ${msg}`);
  }
};

/**
 * Gets current account address selected in metamask
 */
export const getCurrentAccountAddress = () => {
  return (window as any).web3.eth.accounts[0];
};

/**
 * Submits transaction using metamask and returns its hash
 */
export const sendTransaction = async (txConfig: TransactionConfig): Promise<string> => {
  const ethereum = getMetamaskEthereumInstance();
  if (!ethereum) {
    throw new Error('Metamask is not enabled');
  }

  return convertCallbackToPromise(
    ethereum.sendAsync,
    {
      method: 'eth_sendTransaction',
      params: [{
        gasPrice: toHex(txConfig.gasPrice),
        gasLimit: toHex(txConfig.gas),
        to: txConfig.to,
        from: txConfig.from,
        value: toHex(txConfig.value),
        data: txConfig.data,
      }],
      from: txConfig.from,
    },
  ) as Promise<string>;
};

/**
 * Gets current metamask instance
 */
export const getMetamaskEthereumInstance = () => {
  return (window as any).ethereum;
};
