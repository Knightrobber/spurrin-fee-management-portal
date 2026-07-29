import { FastifyInstance } from 'fastify';
import { CreateFeeStructureSchema, GetFeeStructureSchema } from './fee-structures.schema';
import { postFeeStructureHandler, getFeeStructureHandler } from './fee-structures.handler';

export async function feeStructureRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post(
    '/',
    { schema: CreateFeeStructureSchema },
    postFeeStructureHandler
  );

  fastify.get(
    '/:id',
    { schema: GetFeeStructureSchema },
    getFeeStructureHandler
  );
}
