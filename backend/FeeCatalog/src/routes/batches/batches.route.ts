import { FastifyInstance } from 'fastify';
import { CreateBatchSchema, GetBatchSchema, ListBatchesSchema } from './batches.schema';
import { getBatchHandler, getBatchesHandler, postBatchHandler } from './batches.handler';

export async function batchRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/', { schema: CreateBatchSchema }, postBatchHandler);

  fastify.get('/', { schema: ListBatchesSchema }, getBatchesHandler);

  fastify.get('/:id', { schema: GetBatchSchema }, getBatchHandler);
}
