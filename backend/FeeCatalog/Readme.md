This is a backend repository that manages the Fee Catalog of medical colleges. 

Project Structure
This is a typescript project. It uses Fastify to created endpoints and use typebox to define the schema. It also has a swagger UI then is rendered from the spec.yaml file. It has 2 database connections, 1 is a postgres SQL db and one is a mongoDb database. Both contain the same data and the clients get to choose which db they want to use.
There are readme's in the respective folders to help you understand the file strcytrue

## Current status
The project scaffolding is in place (Fastify + TypeBox + dynamic Swagger UI) along with a sample `health` endpoint that returns a static JSON payload. Business logic and the Postgres/MongoDB client connections have not been implemented yet.

## Folder layout
- `src/app.ts` — builds the Fastify instance, registers the Swagger/Swagger UI plugins (generated dynamically from route schemas), and registers route plugins.
- `src/server.ts` — entry point that starts the HTTP server.
- `src/routes/<domain>/` — one folder per endpoint domain (e.g. `health`), each with `*.route.ts`, `*.handler.ts`, `*.schema.ts`, and a co-located `*.handler.test.ts`. See `src/routes/Readme.md` for the full convention.
- `src/data/` — will hold the Postgres/MongoDB data-access logic (not yet implemented). See `src/data/Readme.md`.
- `openapi/spec.yaml` — the OpenAPI document generated from route schemas via `npm run spec:generate`. Never hand-edit it.
- `docs/` — ER diagram and NoSQL data model documentation.
- `fee_structures/` — reference material (sample fee structure documents from real colleges) used to inform the data model.

## Getting started
```bash
npm install
npm run dev              # start the dev server with hot reload (tsx watch)
npm test                  # run the test suite (jest)
npm run build && npm start   # compile to dist/ and run the compiled server
npm run spec:generate     # build, then regenerate openapi/spec.yaml from route schemas
```

Once running, the API is available at `http://localhost:3000` (configurable via `PORT`/`HOST` env vars — see `.env`):
- `GET /health` — static health check payload
- `GET /documentation` — Swagger UI generated dynamically from route schemas
