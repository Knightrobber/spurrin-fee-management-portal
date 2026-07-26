import { FastifyInstance } from 'fastify';
import { CreateFeeStructureSchema } from './fee-structures.schema';
import { postFeeStructureHandler } from './fee-structures.handler';

export async function feeStructureRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post(
    '/',
    { schema: CreateFeeStructureSchema },
    postFeeStructureHandler
  );
}
