import { FastifyInstance, FastifyError } from 'fastify';
import { HttpError } from '../shared/http-error';

/**
 * Registers the centralized Fastify error handler directly on the root app instance
 * (not via app.register) so it applies globally, including to sibling route plugins.
 */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError | HttpError, request, reply) => {
    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send({
        errors: [
          {
            status: String(error.statusCode),
            code: error.errorCode,
            title: error.name,
            detail: error.message
          }
        ]
      });
    }

    if (error.validation) {
      return reply.status(400).send({
        errors: [
          {
            status: '400',
            code: 'VALIDATION_ERROR',
            title: 'Bad Request',
            detail: error.message
          }
        ]
      });
    }

    request.log.error(error);
    return reply.status(500).send({
      errors: [
        {
          status: '500',
          code: 'INTERNAL_SERVER_ERROR',
          title: 'Internal Server Error',
          detail: 'An unexpected error occurred.'
        }
      ]
    });
  });
}
