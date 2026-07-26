#!/usr/bin/env node
/**
 * Builds the Fastify app, generates the OpenAPI document from the route
 * schemas, and writes it to openapi/spec.yaml.
 *
 * Requires a build first: `npm run build && node scripts/generate-spec.mjs`
 * (or just `npm run spec:generate`, which does both).
 *
 * Usage: node scripts/generate-spec.mjs
 */

import { mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, '../openapi');
const OUTPUT_PATH = resolve(OUTPUT_DIR, 'spec.yaml');

const { buildApp } = await import('../dist/app.js');

const app = await buildApp();
await app.ready();

const spec = app.swagger({ yaml: true });

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(OUTPUT_PATH, spec, 'utf8');

await app.close();

console.log(`spec written to ${OUTPUT_PATH}`);
