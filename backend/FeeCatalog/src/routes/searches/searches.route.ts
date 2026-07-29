import { FastifyInstance } from 'fastify';
import { SearchFeeStructuresSchema, SearchPageSchema } from './searches.schema';
import { getSearchFeeStructuresHandler, getSearchPageHandler } from './searches.handler';

export async function searchRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/page', { schema: SearchPageSchema }, getSearchPageHandler);

  fastify.get('/fee-structures', { schema: SearchFeeStructuresSchema }, getSearchFeeStructuresHandler);
}
