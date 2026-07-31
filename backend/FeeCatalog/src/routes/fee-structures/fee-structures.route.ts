import { FastifyInstance } from 'fastify';
import {
  CreateFeeStructureSchema,
  GetFeeStructureSchema,
  CreateFeeStructureVersionSchema,
  GetFeeStructureVersionSchema,
  DeleteFeeStructureVersionSchema,
  PublishFeeStructureVersionSchema
} from './fee-structures.schema';
import {
  postFeeStructureHandler,
  getFeeStructureHandler,
  postFeeStructureVersionHandler,
  getFeeStructureVersionHandler,
  deleteFeeStructureVersionHandler,
  publishFeeStructureVersionHandler
} from './fee-structures.handler';

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

  fastify.post(
    '/:id/versions',
    { schema: CreateFeeStructureVersionSchema },
    postFeeStructureVersionHandler
  );

  fastify.get(
    '/:id/versions/:versionId',
    { schema: GetFeeStructureVersionSchema },
    getFeeStructureVersionHandler
  );

  fastify.delete(
    '/:id/versions/:versionId',
    { schema: DeleteFeeStructureVersionSchema },
    deleteFeeStructureVersionHandler
  );

  fastify.post(
    '/:id/versions/:versionId/publish',
    { schema: PublishFeeStructureVersionSchema },
    publishFeeStructureVersionHandler
  );
}
