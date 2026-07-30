import { Type, Static } from '@sinclair/typebox';
import { errorResponseSchema } from '../../shared/schema/error-response.schema';

export const createBatchBodySchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  startDate: Type.String({ format: 'date', description: 'ISO 8601 date (YYYY-MM-DD)' }),
  endDate: Type.String({ format: 'date', description: 'ISO 8601 date (YYYY-MM-DD)' })
});

export type CreateBatchBody = Static<typeof createBatchBodySchema>;

const batchAttributesSchema = Type.Object({
  name: Type.String(),
  startDate: Type.String({ description: 'ISO 8601 date (YYYY-MM-DD)' }),
  endDate: Type.String({ description: 'ISO 8601 date (YYYY-MM-DD)' })
});

export const batchResourceSchema = Type.Object({
  data: Type.Object({
    type: Type.Literal('batches'),
    id: Type.String(),
    attributes: batchAttributesSchema
  })
});

export type BatchResource = Static<typeof batchResourceSchema>;

export const batchListResponseSchema = Type.Object({
  data: Type.Array(
    Type.Object({
      type: Type.Literal('batches'),
      id: Type.String(),
      attributes: batchAttributesSchema
    })
  )
});

export type BatchListResponse = Static<typeof batchListResponseSchema>;

export const CreateBatchSchema = {
  description: 'Creates a new batch (intake cohort for a course in an admission year).',
  tags: ['batches'],
  body: createBatchBodySchema,
  response: {
    201: batchResourceSchema,
    400: errorResponseSchema
  }
};

export const ListBatchesSchema = {
  description: 'Returns every batch, ordered by start date descending (newest intake first).',
  tags: ['batches'],
  response: {
    200: batchListResponseSchema
  }
};

export const getBatchParamsSchema = Type.Object({
  id: Type.String({ pattern: '^[1-9][0-9]*$', description: 'Batch id' })
});

export type GetBatchParams = Static<typeof getBatchParamsSchema>;

export const GetBatchSchema = {
  description: 'Returns a single batch by id.',
  tags: ['batches'],
  params: getBatchParamsSchema,
  response: {
    200: batchResourceSchema,
    400: errorResponseSchema,
    404: errorResponseSchema
  }
};
