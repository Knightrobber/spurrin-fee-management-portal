import { FastifyReply, FastifyRequest } from 'fastify';
import {
  BatchListResponse,
  BatchResource,
  CreateBatchBody,
  GetBatchParams
} from './batches.schema';
import { createBatch, getBatchById, listBatches } from './batches.service';

export async function postBatchHandler(
  request: FastifyRequest<{ Body: CreateBatchBody }>,
  reply: FastifyReply
): Promise<BatchResource> {
  const resource = await createBatch(request.body);

  reply.header('Location', `/batches/${resource.data.id}`);
  reply.code(201);

  return resource;
}

export async function getBatchesHandler(): Promise<BatchListResponse> {
  return listBatches();
}

export async function getBatchHandler(
  request: FastifyRequest<{ Params: GetBatchParams }>
): Promise<BatchResource> {
  return getBatchById(request.params.id);
}
