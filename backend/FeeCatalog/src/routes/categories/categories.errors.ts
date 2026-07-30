import { HttpError } from '../../shared/http-error';

/** No category exists for the given id. */
export class CategoryNotFoundError extends HttpError {
  readonly statusCode = 404;
  readonly errorCode = 'CATEGORY_NOT_FOUND';

  constructor(id: string) {
    super(`No category exists with id ${id}.`);
  }
}
