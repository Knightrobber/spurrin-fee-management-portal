import { FastifyInstance } from 'fastify';
import {
  CreateCategorySchema,
  GetCategorySchema,
  ListCategoriesSchema
} from './categories.schema';
import {
  getCategoriesHandler,
  getCategoryHandler,
  postCategoryHandler
} from './categories.handler';

export async function categoryRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/', { schema: CreateCategorySchema }, postCategoryHandler);

  fastify.get('/', { schema: ListCategoriesSchema }, getCategoriesHandler);

  fastify.get('/:id', { schema: GetCategorySchema }, getCategoryHandler);
}
