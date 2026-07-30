import { HttpError } from '../../shared/http-error';

/** No course exists for the given id. */
export class CourseNotFoundError extends HttpError {
  readonly statusCode = 404;
  readonly errorCode = 'COURSE_NOT_FOUND';

  constructor(id: string) {
    super(`No course exists with id ${id}.`);
  }
}
