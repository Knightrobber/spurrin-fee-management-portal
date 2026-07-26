import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateFeeStructureBody, CreateFeeStructureResponse } from './fee-structures.schema';
import { createFeeStructure } from './fee-structures.service';

export async function postFeeStructureHandler(
  request: FastifyRequest<{ Body: CreateFeeStructureBody }>,
  reply: FastifyReply
): Promise<CreateFeeStructureResponse> {
  const resource = await createFeeStructure(request.body);

  reply.header('Location', `/fee-structures/${resource.data.id}`);
  reply.code(201);

  return resource;
}
