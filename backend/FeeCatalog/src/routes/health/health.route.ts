import { FastifyInstance } from 'fastify';
import { HealthResponseSchema } from './health.schema';
import { getHealthHandler } from './health.handler';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get(
    '/',
    { schema: HealthResponseSchema },
    getHealthHandler
  );
}
