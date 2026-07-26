/**
 * Base class for all domain HTTP errors.
 * The centralized Fastify error handler (see `app.ts`) checks `instanceof HttpError`
 * to decide the response shape; domain `*.errors.ts` files should extend this.
 */
export abstract class HttpError extends Error {
  abstract readonly statusCode: number;
  abstract readonly errorCode: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
