---
name: db-modelling-and-implmentation
description: 'Use when adding, modifying, or locating database models, schemas, or repositories in the FeeCatalog backend (SQL/Postgres via Prisma, or NoSQL/MongoDB). Covers where DB client, models, and repository/query code must live, and current scaffolding status.'
---

# DB Modelling and Implementation

## Overview

This project has 2 databases — a SQL database (Postgres, via Prisma) and a NoSQL database (MongoDB) — that house the same data. All logic related to fetching data from either database lives under `src/data/`.

**All DB models and repositories (for both the SQL and NoSQL sides) live under this `data/` folder — there is no separate top-level location for them.**

## Folder Structure

```
src/data/
├── sql/
│   ├── client.ts             # Singleton PrismaClient instance (dbClient)
│   ├── migrations/           # Prisma migrations (sibling to models/, per prisma.config.ts)
│   ├── models/                # actual *.prisma table definitions (Prisma schema folder)
│   │   ├── schema.prisma      # generator + datasource block ("main" schema file)
│   │   ├── enums.prisma       # shared enums (e.g. VersionStatus)
│   │   └── <table>.prisma     # one Prisma model per table, e.g. course.prisma, fee-structure.prisma
│   ├── types/
│   │   └── models.types.ts    # re-exports every Prisma-generated type, one export list for all tables
│   └── repositories/
│       └── <domain>/                    # one folder per domain, e.g. fee-structures/
│           ├── <table>.repository.ts    # query/mutation functions for that domain
│           ├── <table>.errors.ts        # repository-level errors (name, statusCode, errorCode)
│           └── <table>.types.ts         # plain domain input types used by the repository (not Prisma's nested create shapes)
└── nosql/                    # (placeholder) MongoDB sibling, mirrors sql/
```

There is no top-level `prisma/` folder — `prisma.config.ts` points directly at `src/data/sql/models`
for the schema and `src/data/sql/migrations` for migrations. This has been verified to work with
`prisma validate` / `prisma generate` / `prisma migrate status`.

## Error handling
- Each repository raises its own errors from `<table>.errors.ts`, co-located in its `repositories/<domain>/` folder, each carrying a `name`, `statusCode`, and `errorCode` (extends the shared `HttpError` base class from `src/shared/http-error.ts`). The centralized Fastify error handler (`src/plugins/error-handler.ts`) maps these to HTTP responses.
- Repository functions accept a plain domain input type (defined in that domain's `<table>.types.ts`), not a Prisma-specific `create`/`update` shape — a private transformer inside the `.repository.ts` file is the only place that builds the actual Prisma nested-write input.

### Why `.prisma` files live under `src/data/sql/models/`, separate from `types/`
Prisma's multi-file schema feature requires every `*.prisma` file to live inside the same
directory tree as the file containing the `generator`/`datasource` blocks (`schema.prisma`).
`src/data/sql/models/` is configured as that schema folder (via `schema: 'src/data/sql/models'`
in `prisma.config.ts`), so the actual model definitions live there directly. A single
`src/data/sql/types/models.types.ts` file re-exports every Prisma-generated type, e.g.:

```ts
// src/data/sql/types/models.types.ts
export type {
  Course,
  Category,
  Batch,
  FeeStructure,
  FeeStructureVersion,
  Term,
  TermComponent,
  OneTimeCost,
  Addon,
  AddonVersion,
  VersionStatus
} from '@prisma/client';
```

## SQL (Postgres, via Prisma)

- `sql/client.ts` — exports the singleton DB client (`dbClient`), a `PrismaClient` instance. Import this directly wherever a query is needed; there is no framework plugin/decorator wrapping it.
- `sql/models/<table>.prisma` — one per table, the actual Prisma model definition. Use `@map`/`@@map` to match the snake_case column/table names from the ER diagram.
- `sql/types/models.types.ts` — single file re-exporting the Prisma-generated type for every table/enum (see above). Add a new export here whenever a new model is added, rather than creating a per-table file.
- `sql/migrations/` — Prisma migration history, configured via `migrations.path` in `prisma.config.ts`.
- `sql/repositories/<domain>/` — one folder per domain (e.g. `fee-structures/`). Example, from the `fee-structures` domain:
  - `fee-structure.repository.ts` — query/mutation functions, e.g. `createFeeStructureWithFirstVersion`. Accepts the domain's plain input type; internally transforms it into the Prisma nested `create`/`update` shape before calling `dbClient`.
  - `fee-structure.errors.ts` — errors this repository can throw (e.g. `FeeStructureConflictError`, `InvalidFeeStructureReferenceError`), mapped from Prisma error codes (P2002, P2003, etc.).
  - `fee-structure.types.ts` — plain input types for the repository's functions (e.g. `CreateFeeStructureData`), hand-written rather than derived from Prisma's generated types, so callers never need to build Prisma-specific `create:` blocks.

The server calls `dbClient.$connect()` once at startup (in `src/server.ts`) so connection failures are caught early; no other lifecycle wiring is needed.

## NoSQL (MongoDB)

A `nosql/` sibling folder (mirroring `sql/`) is reserved for the MongoDB side later. Not created yet.

## Current Status

Tables from the fee-catalog ER diagram (courses, categories, batches, fee_structures,
fee_structure_versions, terms, term_components, one_time_costs, addons, addon_versions) are
modeled under `src/data/sql/models/`, with their generated types re-exported from
`src/data/sql/types/models.types.ts`. The `fee-structures` domain has a repository
(`src/data/sql/repositories/fee-structures/`) with its own `.repository.ts`, `.errors.ts`,
and `.types.ts`. No other repositories exist yet.

## When Adding New DB Code

1. SQL model → add `src/data/sql/models/<table>.prisma` (actual Prisma model) and add its type(s) to the export list in `src/data/sql/types/models.types.ts`.
2. SQL queries → `src/data/sql/repositories/<domain>/<table>.repository.ts`, with sibling `<table>.errors.ts` and `<table>.types.ts` in the same domain folder (see the `fee-structures` example above).
3. NoSQL models/queries → `src/data/nosql/` (create mirroring `models/`/`repositories/` subfolders as needed).
4. Never place model, type, or repository files outside `src/data/`. All `.prisma` files, `types/models.types.ts`, migrations, and per-domain repository folders live under `src/data/sql/`.
