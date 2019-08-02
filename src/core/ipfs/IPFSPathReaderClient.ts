import { IIPFSClient, IIPFSDag } from 'verifiable-data';
import { createFriendlyError } from '../error/FriendlyError';
import { ErrorCode } from '../error/ErrorCode';

export class IPFSPathReaderClient implements IIPFSClient {
  public dag: IIPFSDag;

  public async add(): Promise<any> {
    throw createFriendlyError(ErrorCode.NOT_SUPPORTED, 'This operation is not supported');
  }

  public async cat(path: string): Promise<Buffer> {
    return Buffer.from(path, 'utf8');
  }
}
