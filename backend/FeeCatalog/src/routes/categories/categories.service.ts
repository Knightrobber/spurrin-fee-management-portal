import {
  createCategory as createCategoryRecord,
  findAllCategories,
  findCategoryById
} from '../../data/sql/repositories/categories/category.repository';
import { Category } from '../../data/sql/types/models.types';
import {
  CategoryListResponse,
  CategoryResource,
  CreateCategoryBody
} from './categories.schema';
import { CategoryNotFoundError } from './categories.errors';

export async function createCategory(body: CreateCategoryBody): Promise<CategoryResource> {
  const created = await createCategoryRecord({ name: body.name });
  return toCategoryResource(created);
}

export async function listCategories(): Promise<CategoryListResponse> {
  const categories = await findAllCategories();
  return { data: categories.map(toCategoryResourceData) };
}

export async function getCategoryById(id: string): Promise<CategoryResource> {
  const category = await findCategoryById(BigInt(id));

  if (!category) {
    throw new CategoryNotFoundError(id);
  }

  return toCategoryResource(category);
}

function toCategoryResourceData(category: Category): CategoryResource['data'] {
  return {
    type: 'categories',
    id: category.id.toString(),
    attributes: { name: category.name }
  };
}

function toCategoryResource(category: Category): CategoryResource {
  return { data: toCategoryResourceData(category) };
}
