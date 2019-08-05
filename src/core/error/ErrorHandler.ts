import { ErrorCode } from './ErrorCode';
import { IFriendlyError, createFriendlyError } from './FriendlyError';
import { translate } from 'src/i18n';
import { defaultErrorMessageHandlers } from './DefaultErrorMessageHandlers';
import { ILoggingService } from '../logging/ILoggingService';

// #region -------------- Types -------------------------------------------------------------------

type ErrorCodeSelect = (errorCodes: typeof ErrorCode) => ErrorCode;

export type FlowHandler = (friendlyError: IFriendlyError) => any;
export type ErrorMessageRetriever = (error: Error) => string;
export type OnAnyErrorHandler = (friendlyError: IFriendlyError) => any;
export type ErrorCodeExtractor = (error: Error) => ErrorCode;

// #endregion

// #region -------------- Class -------------------------------------------------------------------

export class ErrorHandler {
  private error: Error;
  private messageRetrievers = new Map<ErrorCode, ErrorMessageRetriever>();
  private flowHandlers = new Map<ErrorCode, FlowHandler>();
  private onAnyErrorHandler: OnAnyErrorHandler;
  private logger: ILoggingService;

  private errorCodeExtractors: ErrorCodeExtractor[] = [];

  constructor(error: Error, logger: ILoggingService) {
    this.error = error;
    this.logger = logger;
  }

  // #region -------------- Error handler registration -------------------------------------------------------------------

  public addErrorCodeExtractor(extractor: ErrorCodeExtractor, addAsFirst?: boolean) {

    if (addAsFirst) {
      this.errorCodeExtractors.unshift(extractor);
      return this;
    }

    this.errorCodeExtractors.push(extractor);

    return this;
  }

  public addHandler(errorCodeSelector: ErrorCodeSelect | ErrorCodeSelect[], messageRetriever?: ErrorMessageRetriever, flowHandler?: FlowHandler) {
    let selectors = errorCodeSelector;

    if (!Array.isArray(selectors)) {
      selectors = [selectors];
    }

    selectors.forEach(selector => {
      const code = selector(ErrorCode);

      if (messageRetriever) {
        this.messageRetrievers.set(code, messageRetriever);
      }

      if (flowHandler) {
        this.flowHandlers.set(code, flowHandler);
      }
    });

    return this;
  }

  public onAnyError(handler: OnAnyErrorHandler) {
    this.onAnyErrorHandler = handler;
    return this;
  }

  // #endregion

  // #region -------------- Error processing -------------------------------------------------------------------

  public process() {
    try {
      this.validateConfiguration();

      // Log every error
      this.logger.info(this.error);

      let friendlyError: IFriendlyError = this.error as IFriendlyError;

      // If this is not a friendly error - process error to convert to one
      if (friendlyError.friendlyMessage === undefined) {
        const code = this.extractErrorCode();

        // Get friendly error for given code
        friendlyError = this.getFriendlyError(code);
      }

      // Execute any error handler
      return this.executeErrorHandler(friendlyError.errorCode, friendlyError);

    } catch (error) {
      this.logger.warning(error);
      throw error;
    }
  }

  private extractErrorCode = (): ErrorCode => {
    let code: ErrorCode = null;

    for (const extractor of this.errorCodeExtractors) {
      code = extractor(this.error);

      if (code) {
        break;
      }
    }

    if (!code) {
      code = ErrorCode.UNKNOWN;
    }

    return code;
  }

  // #endregion

  // #region -------------- Helpers -------------------------------------------------------------------

  private validateConfiguration() {
    if (!this.onAnyErrorHandler) {
      throw Error('Error handler configuration is invalid. You must register any error handler');
    }
  }

  private getFriendlyError(code: ErrorCode) {
    const friendlyError = createFriendlyError(
      code,
      translate(e => e.errors.somethingUnexpectedHasHappended),
      this.error,
    );

    if (this.messageRetrievers.has(code)) {
      friendlyError.friendlyMessage = this.messageRetrievers.get(code)(this.error);
      return friendlyError;
    }

    const defaultMessageHandler = defaultErrorMessageHandlers.get(code);

    if (defaultMessageHandler) {
      friendlyError.friendlyMessage = defaultMessageHandler(this.error);
    }

    return friendlyError;
  }

  private executeErrorHandler(code: ErrorCode, friendlyError: IFriendlyError) {
    let iterator: any;

    if (this.flowHandlers.has(code)) {
      iterator = this.flowHandlers.get(code)(friendlyError);
    } else {
      iterator = this.onAnyErrorHandler(friendlyError);
    }

    return iterator;
  }

  // #endregion
}

// #endregion
