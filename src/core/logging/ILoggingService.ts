export enum MessageType {
  Info,
  Warning,
  Error,
}

export interface ILoggingService {
  log(obj: any, type: MessageType);
  error(obj: any);
  warning(obj: any);
  info(obj: any);
}
