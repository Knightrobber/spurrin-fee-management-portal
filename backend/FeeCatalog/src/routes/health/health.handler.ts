import { FastifyRequest } from 'fastify';
import { HealthResponse } from './health.schema';

export async function getHealthHandler(
  _request: FastifyRequest
): Promise<HealthResponse> {
  return {
    status: 'ok',
    service: 'fee-catalog',
    timestamp: new Date().toISOString()
  };
}
