import { HttpError } from '../../../../shared/http-error';

/** A fee structure already exists for this (courseId, categoryId, batchId) combination. */
export class FeeStructureConflictError extends HttpError {
  readonly statusCode = 409;
  readonly errorCode = 'FEE_STRUCTURE_ALREADY_EXISTS';

  constructor(courseId: number, categoryId: number, batchId: number) {
    super(
      `A fee structure already exists for courseId ${courseId}, categoryId ${categoryId}, batchId ${batchId}.`
    );
  }
}

/** courseId, categoryId, or batchId does not reference an existing record. */
export class InvalidFeeStructureReferenceError extends HttpError {
  readonly statusCode = 400;
  readonly errorCode = 'INVALID_REFERENCE';

  constructor() {
    super('courseId, categoryId, or batchId does not reference an existing course, category, or batch.');
  }
}
