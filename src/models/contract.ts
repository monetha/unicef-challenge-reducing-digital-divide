import { Address } from 'verifiable-data';

/**
 * Represents contract between school and ISP
 */
export interface IContract {
  id: string;
  ispAddress: Address;
  schoolAddress: Address;

  /**
   * Minimal speed that ISP must deliver to school on daily basis
   */
  speed: number;
  state: ContractState;
  connectivityScore: number;
}

export enum ContractState {
  Active = 0,
  Inactive = 1,
}

export interface IFactReportEntry {
  ispAddress: Address;
  ispSpeed: number;
  schoolAddress: Address;
  schoolSpeed: number;
  date: Date;
}
