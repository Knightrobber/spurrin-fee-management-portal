import { FastifyReply, FastifyRequest } from 'fastify';
import {
  CategoryListResponse,
  CategoryResource,
  CreateCategoryBody,
  GetCategoryParams
} from './categories.schema';
import { createCategory, getCategoryById, listCategories } from './categories.service';

export async function postCategoryHandler(
  request: FastifyRequest<{ Body: CreateCategoryBody }>,
  reply: FastifyReply
): Promise<CategoryResource> {
  const resource = await createCategory(request.body);

  reply.header('Location', `/categories/${resource.data.id}`);
  reply.code(201);

  return resource;
}

export async function getCategoriesHandler(): Promise<CategoryListResponse> {
  return listCategories();
}

export async function getCategoryHandler(
  request: FastifyRequest<{ Params: GetCategoryParams }>
): Promise<CategoryResource> {
  return getCategoryById(request.params.id);
}
