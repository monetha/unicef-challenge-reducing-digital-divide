import { Address } from 'verifiable-data';
import { getServices } from 'src/ioc/services';
import { ethNetworkUrls, etherscanUrls, passportScannerUrl } from 'src/constants/api';

export const getEtherscanUrl = (address: Address) => {
  const { ethNetworkUrl } = getServices();

  let rootUrl = '';

  switch (ethNetworkUrl) {
    case ethNetworkUrls.ropsten:
      rootUrl = etherscanUrls.ropsten;
      break;

    case ethNetworkUrls.mainnet:
      rootUrl = etherscanUrls.mainnet;
      break;

    default:
      return null;
  }

  return `${rootUrl}/address/${address}`;
};

export const getPassportScannerUrl = (address: Address) => {
  const { ethNetworkUrl } = getServices();

  switch (ethNetworkUrl) {
    case ethNetworkUrls.ropsten:
      return `${passportScannerUrl}/identity/${address}?network=ropsten`;

    case ethNetworkUrls.mainnet:
      return `${passportScannerUrl}/identity/${address}?network=mainnet`;

    default:
      return `${passportScannerUrl}/identity/${address}?network=${encodeURIComponent(ethNetworkUrl)}`;
  }
};
