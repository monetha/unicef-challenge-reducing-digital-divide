import { Address } from 'verifiable-data';

/**
 * Represents info about ISP
 */
export interface IISP {
  name: string;

  /**
   * ISP data source Ethereum address
   */
  address: Address;
  score: number;
}
