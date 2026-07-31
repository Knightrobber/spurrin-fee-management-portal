import { FastifyReply, FastifyRequest } from 'fastify';
import {
  CreateFeeStructureBody,
  CreateFeeStructureResponse,
  CreateFeeStructureVersionBody,
  CreateFeeStructureVersionResponse,
  FeeStructureVersionParams,
  GetFeeStructureParams,
  GetFeeStructureResponse,
  GetFeeStructureVersionResponse,
  PublishFeeStructureVersionResponse
} from './fee-structures.schema';
import {
  createFeeStructure,
  createFeeStructureVersion,
  deleteFeeStructureVersion,
  getFeeStructureById,
  getFeeStructureVersion,
  publishFeeStructureVersion
} from './fee-structures.service';

export async function postFeeStructureHandler(
  request: FastifyRequest<{ Body: CreateFeeStructureBody }>,
  reply: FastifyReply
): Promise<CreateFeeStructureResponse> {
  const resource = await createFeeStructure(request.body);

  reply.header('Location', `/fee-structures/${resource.data.id}`);
  reply.code(201);

  return resource;
}

export async function getFeeStructureHandler(
  request: FastifyRequest<{ Params: GetFeeStructureParams }>
): Promise<GetFeeStructureResponse> {
  return getFeeStructureById(request.params.id);
}

export async function postFeeStructureVersionHandler(
  request: FastifyRequest<{ Params: GetFeeStructureParams; Body: CreateFeeStructureVersionBody }>,
  reply: FastifyReply
): Promise<CreateFeeStructureVersionResponse> {
  const resource = await createFeeStructureVersion(request.params.id, request.body);

  reply.header(
    'Location',
    `/fee-structures/${request.params.id}/versions/${resource.data.attributes.versionId}`
  );
  reply.code(201);

  return resource;
}

export async function getFeeStructureVersionHandler(
  request: FastifyRequest<{ Params: FeeStructureVersionParams }>
): Promise<GetFeeStructureVersionResponse> {
  return getFeeStructureVersion(request.params.id, request.params.versionId);
}

export async function deleteFeeStructureVersionHandler(
  request: FastifyRequest<{ Params: FeeStructureVersionParams }>,
  reply: FastifyReply
): Promise<void> {
  await deleteFeeStructureVersion(request.params.id, request.params.versionId);

  reply.code(204);
}

export async function publishFeeStructureVersionHandler(
  request: FastifyRequest<{ Params: FeeStructureVersionParams }>
): Promise<PublishFeeStructureVersionResponse> {
  return publishFeeStructureVersion(request.params.id, request.params.versionId);
}
