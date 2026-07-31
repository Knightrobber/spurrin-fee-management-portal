---
name: rest-route-best-practices
description: Best practices to follow when defining a new route or updating an existing one in the Fee Catalog backend.
---

# REST Route Best Practices

## Domain folder structure
Each endpoint domain gets its own folder under `src/routes/<domain>/`:
- `domain.route.ts` — registers endpoints and wires each to its handler. Apply the schema exported from `domain.schema.ts` wholesale, e.g. `{ schema: DomainNameSchema }`. Do not define schemas inline here.
- `domain.handler.ts` — thin request handler. Only minimal logic; if it grows too big, move it into `domain.service.ts`.
- `domain.service.ts` — business logic, added only once handler logic becomes too large for the handler file.
- `domain.schema.ts` — TypeBox schemas for params, query, body, and response, exported as complete Fastify route schema objects (description, tags, params, body, response, etc.).
- `domain.errors.ts` — domain-specific errors, each with a `name`, `statusCode`, and `errorCode`.
- `domain.handler.test.ts` — jest test file, co-located with the handler it tests.

If any file gets too big, create a subfolder and split it based on the best logical segregation.

## API conventions
- Follow the JSON:API spec for request/response shapes.
- Every schema must define its parameters, request body, response, and error shapes.

## Error handling
- Handlers must not build or format error responses directly.
- Each domain raises its own errors from `domain.errors.ts`, each carrying a `name`, `statusCode`, and `errorCode`.
- A centralized error handler is the only place allowed to decide what errors/shapes are sent back to clients.

## OpenAPI spec
- `openapi/spec.yaml` is generated from route schemas by running `npm run spec:generate`. Never hand-edit it.
- Swagger UI (`/documentation`) is served dynamically from the same route schemas, so accurate schemas keep the docs accurate.

## Example
The `health` domain (`src/routes/health/`) follows this convention and can be used as a reference:
- `health.route.ts` — registers `GET /` (mounted under the `/health` prefix in `app.ts`) and wires it to the handler using the schema exported from `health.schema.ts`.
- `health.handler.ts` — returns a static status payload; no business logic yet.
- `health.schema.ts` — exports `HealthResponseSchema`, the full Fastify route schema (description, tags, response) built with TypeBox.
- `health.handler.test.ts` — jest test that injects a request into the built app and asserts the response shape.
- `health.transformer.ts` — has the methods that transform the data from the db to the response schema
Note: the Swagger/OpenAPI documentation is generated dynamically from these route schemas (see `src/app.ts`). Do not hand-edit `openapi/spec.yaml` — it is produced by running `npm run spec:generate`.