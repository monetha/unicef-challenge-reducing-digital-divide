import { ILoggingService, MessageType } from './ILoggingService';

export class LoggingService implements ILoggingService {

  public log(obj: any, type: MessageType) {
    let outputArray = [obj];

    if (obj instanceof Error) {
      outputArray = [obj.message, obj.stack, obj];
    }

    switch (type) {
      case MessageType.Error:
        console.error.apply(console, outputArray);
        break;

      case MessageType.Warning:
        if (process.env.APP_ENV !== 'production') {
          console.warn.apply(console, outputArray);
        }
        break;

      case MessageType.Info:
      default:
        if (process.env.APP_ENV !== 'production') {
          console.log.apply(console, outputArray);
        }
        break;
    }
  }

  public error(obj: any) {
    this.log(obj, MessageType.Error);
  }

  public warning(obj: any) {
    this.log(obj, MessageType.Warning);
  }

  public info(obj: any) {
    this.log(obj, MessageType.Info);
  }
}
