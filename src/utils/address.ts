import { Address } from 'verifiable-data';
import { getServices } from 'src/ioc/services';
import { ethNetworkUrls, etherscanUrls } from 'src/constants/api';

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
