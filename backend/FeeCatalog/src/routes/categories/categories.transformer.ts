import { Category } from '../../data/sql/types/models.types';
import { CategoryResource } from './categories.schema';

/** Builds the JSON:API resource object (`data`) for a single category. */
export function toCategoryResourceData(category: Category): CategoryResource['data'] {
  return {
    type: 'categories',
    id: category.id.toString(),
    attributes: { name: category.name }
  };
}

/** Wraps a single category in a top-level JSON:API document. */
export function toCategoryResource(category: Category): CategoryResource {
  return { data: toCategoryResourceData(category) };
}
