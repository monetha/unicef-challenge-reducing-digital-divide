import { ErrorCode } from './ErrorCode';
import { ErrorMessageRetriever } from './ErrorHandler';
import { translate } from 'src/i18n';

export const defaultErrorMessageHandlers: Map<ErrorCode, ErrorMessageRetriever> =
  new Map<ErrorCode, ErrorMessageRetriever>(
    [
      [ErrorCode.CONNECTIVITY_PROBLEMS, () => translate(t => t.errors.connectivityProblems)],
      [ErrorCode.INTERNAL_ERROR, () => translate(t => t.errors.somethingUnexpectedHasHappended)],
      [ErrorCode.METHOD_NOT_ALLOWED, () => translate(t => t.errors.somethingUnexpectedHasHappended)],
      [ErrorCode.NOT_IMPLEMENTED, () => translate(t => t.errors.somethingUnexpectedHasHappended)],
      [ErrorCode.RESOURCE_NOT_FOUND, () => translate(t => t.errors.somethingUnexpectedHasHappended)],
      [ErrorCode.TIMEOUT, () => translate(t => t.errors.timeout)],
      [ErrorCode.UNKNOWN, () => translate(t => t.errors.somethingUnexpectedHasHappended)],
      [ErrorCode.VALIDATION_ERROR, () => translate(t => t.errors.somethingUnexpectedHasHappended)],
      [ErrorCode.TOO_MANY_RESULTS, () => translate(t => t.errors.tooManyResults)],
      [ErrorCode.INVALID_ADDRESS, () => translate(t => t.errors.invalidAddress)],
    ],
  );
