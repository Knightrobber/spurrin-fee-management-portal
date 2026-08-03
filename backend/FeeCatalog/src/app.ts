import Fastify, { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { healthRoutes } from './routes/health/health.route';
import { feeStructureRoutes } from './routes/fee-structures/fee-structures.route';
import { searchRoutes } from './routes/searches/searches.route';
import { categoryRoutes } from './routes/categories/categories.route';
import { courseRoutes } from './routes/courses/courses.route';
import { batchRoutes } from './routes/batches/batches.route';
import { registerErrorHandler } from './plugins/error-handler';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      transport:
        process.env.NODE_ENV === 'production'
          ? undefined
          : { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } }
    }
  }).withTypeProvider<TypeBoxTypeProvider>();

  registerErrorHandler(app);

  await app.register(fastifyCors, {
    origin: process.env.NODE_ENV === 'production' ? false : true,
    methods: ['GET', 'POST', 'DELETE']
  });

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Fee Catalog API',
        description:
          'API for managing fee structures, add-ons, courses, categories, and batches for medical college admissions.',
        version: '0.1.0'
      }
    }
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/documentation'
  });

  await app.register(categoryRoutes, { prefix: '/categories' });
  await app.register(courseRoutes, { prefix: '/courses' });
  await app.register(batchRoutes, { prefix: '/batches' });
  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(feeStructureRoutes, { prefix: '/fee-structures' });
  await app.register(searchRoutes, { prefix: '/searches' });
  return app;
}
