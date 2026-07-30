import { Type, Static } from '@sinclair/typebox';
import { errorResponseSchema } from '../../shared/schema/error-response.schema';

export const createCategoryBodySchema = Type.Object({
  name: Type.String({ minLength: 1 })
});

export type CreateCategoryBody = Static<typeof createCategoryBodySchema>;

const categoryAttributesSchema = Type.Object({
  name: Type.String()
});

export const categoryResourceSchema = Type.Object({
  data: Type.Object({
    type: Type.Literal('categories'),
    id: Type.String(),
    attributes: categoryAttributesSchema
  })
});

export type CategoryResource = Static<typeof categoryResourceSchema>;

export const categoryListResponseSchema = Type.Object({
  data: Type.Array(
    Type.Object({
      type: Type.Literal('categories'),
      id: Type.String(),
      attributes: categoryAttributesSchema
    })
  )
});

export type CategoryListResponse = Static<typeof categoryListResponseSchema>;

export const CreateCategorySchema = {
  description: 'Creates a new category (quota / seat type).',
  tags: ['categories'],
  body: createCategoryBodySchema,
  response: {
    201: categoryResourceSchema,
    400: errorResponseSchema
  }
};

export const ListCategoriesSchema = {
  description: 'Returns every category, ordered by name.',
  tags: ['categories'],
  response: {
    200: categoryListResponseSchema
  }
};

export const getCategoryParamsSchema = Type.Object({
  id: Type.String({ pattern: '^[1-9][0-9]*$', description: 'Category id' })
});

export type GetCategoryParams = Static<typeof getCategoryParamsSchema>;

export const GetCategorySchema = {
  description: 'Returns a single category by id.',
  tags: ['categories'],
  params: getCategoryParamsSchema,
  response: {
    200: categoryResourceSchema,
    400: errorResponseSchema,
    404: errorResponseSchema
  }
};
