import { Address } from 'verifiable-data';
import { Country } from 'src/constants/countries';

/**
 * Represents info about school
 */
export interface ISchool {
  name: string;

  /**
   * School data source Ethereum address
   */
  address?: Address;
  country: Country;
  score: number;
  physicalAddress?: string;
}
