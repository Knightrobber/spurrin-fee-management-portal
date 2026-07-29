import { HttpError } from '../../shared/http-error';

/**
 * paymentWindowOffsetDays and dueDateOffsetDays are required whenever at least one term
 * is missing its absolute dueDate or paymentWindowOpenDate (they're needed to derive it).
 */
export class MissingFeeStructureOffsetsError extends HttpError {
  readonly statusCode = 400;
  readonly errorCode = 'MISSING_OFFSET_DAYS';

  constructor() {
    super(
      'paymentWindowOffsetDays and dueDateOffsetDays are required when any term is missing dueDate or paymentWindowOpenDate.'
    );
  }
}

/** No fee structure exists for the given id. */
export class FeeStructureNotFoundError extends HttpError {
  readonly statusCode = 404;
  readonly errorCode = 'FEE_STRUCTURE_NOT_FOUND';

  constructor(id: string) {
    super(`No fee structure exists with id ${id}.`);
  }
}

