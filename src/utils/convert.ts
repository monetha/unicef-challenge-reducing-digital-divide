import { toBN } from 'verifiable-data';

export function toHex(value: any) {
  if (value === null || value === undefined) {
    return null;
  }

  return `0x${toBN(value).toString('hex')}`;
}
