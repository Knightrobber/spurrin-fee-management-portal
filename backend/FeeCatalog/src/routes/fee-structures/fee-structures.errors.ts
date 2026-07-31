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

/** No version with the given id exists within the given fee structure lineage. */
export class FeeStructureVersionNotFoundError extends HttpError {
  readonly statusCode = 404;
  readonly errorCode = 'FEE_STRUCTURE_VERSION_NOT_FOUND';

  constructor(id: string, versionId: string) {
    super(`No version with id ${versionId} exists for fee structure ${id}.`);
  }
}

/** An ACTIVE version cannot be deleted; only DRAFT or SUPERSEDED versions may be removed. */
export class ActiveFeeStructureVersionDeletionError extends HttpError {
  readonly statusCode = 409;
  readonly errorCode = 'ACTIVE_VERSION_CANNOT_BE_DELETED';

  constructor(id: string, versionId: string) {
    super(`Version ${versionId} of fee structure ${id} is ACTIVE and cannot be deleted.`);
  }
}

/** The version is already ACTIVE, so there is nothing to publish. */
export class FeeStructureVersionAlreadyActiveError extends HttpError {
  readonly statusCode = 409;
  readonly errorCode = 'FEE_STRUCTURE_VERSION_ALREADY_ACTIVE';

  constructor(id: string, versionId: string) {
    super(`Version ${versionId} of fee structure ${id} is already ACTIVE.`);
  }
}

/** A new version was requested but its content is identical to the current version. */
export class UnchangedFeeStructureVersionError extends HttpError {
  readonly statusCode = 409;
  readonly errorCode = 'FEE_STRUCTURE_VERSION_UNCHANGED';

  constructor(id: string) {
    super(
      `The submitted version is identical to the current version of fee structure ${id}; a new version is only created when something changes.`
    );
  }
}

