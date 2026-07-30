import { HttpError } from '../../shared/http-error';

/** No batch exists for the given id. */
export class BatchNotFoundError extends HttpError {
  readonly statusCode = 404;
  readonly errorCode = 'BATCH_NOT_FOUND';

  constructor(id: string) {
    super(`No batch exists with id ${id}.`);
  }
}

/** endDate must be on or after startDate. */
export class InvalidBatchDatesError extends HttpError {
  readonly statusCode = 400;
  readonly errorCode = 'INVALID_BATCH_DATES';

  constructor() {
    super('endDate must be on or after startDate.');
  }
}
