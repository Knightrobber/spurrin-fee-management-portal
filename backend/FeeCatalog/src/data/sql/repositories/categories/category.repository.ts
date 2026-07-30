import { Category } from '../../types/models.types';
import { dbClient } from '../../client';
import { CreateCategoryData } from './category.types';

export type { CreateCategoryData };

/** Creates a new category. */
export async function createCategory(data: CreateCategoryData): Promise<Category> {
  return dbClient.category.create({ data: { name: data.name } });
}

/** Returns every category, ordered by name. */
export async function findAllCategories(): Promise<Category[]> {
  return dbClient.category.findMany({ orderBy: { name: 'asc' } });
}

/** Returns the category with the given id, or `null` when none exists. */
export async function findCategoryById(id: bigint): Promise<Category | null> {
  return dbClient.category.findUnique({ where: { id } });
}
