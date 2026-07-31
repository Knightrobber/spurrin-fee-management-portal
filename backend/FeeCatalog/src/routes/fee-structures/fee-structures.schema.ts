import { Type, Static } from '@sinclair/typebox';
import { errorResponseSchema } from '../../shared/schema/error-response.schema';

const termComponentInputSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  amount: Type.Integer({ minimum: 0, description: 'Amount in the smallest currency unit (e.g. paise/cents).' })
});

const termInputSchema = Type.Object({
  startDate: Type.String({ description: 'ISO 8601 date (YYYY-MM-DD)' }),
  endDate: Type.String({ description: 'ISO 8601 date (YYYY-MM-DD)' }),
  dueDate: Type.Optional(Type.String({ description: 'ISO 8601 date (YYYY-MM-DD)' })),
  paymentWindowOpenDate: Type.Optional(Type.String({ description: 'ISO 8601 date (YYYY-MM-DD)' })),
  components: Type.Array(termComponentInputSchema, { minItems: 1 })
});

const oneTimeCostInputSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  amount: Type.Integer({ minimum: 0 })
});

export const createFeeStructureBodySchema = Type.Object({
  courseId: Type.Integer({ minimum: 1 }),
  categoryId: Type.Integer({ minimum: 1 }),
  batchId: Type.Integer({ minimum: 1 }),
  name: Type.String({ minLength: 1 }),
  lateFeePerDay: Type.Integer({ minimum: 0 }),
  paymentWindowOffsetDays: Type.Optional(
    Type.Integer({
      minimum: 0,
      description: 'Required if any term is missing dueDate or paymentWindowOpenDate.'
    })
  ),
  dueDateOffsetDays: Type.Optional(
    Type.Integer({
      minimum: 0,
      description: 'Required if any term is missing dueDate or paymentWindowOpenDate.'
    })
  ),
  terms: Type.Array(termInputSchema, { minItems: 1 }),
  oneTimeCosts: Type.Optional(Type.Array(oneTimeCostInputSchema))
});

export type CreateFeeStructureBody = Static<typeof createFeeStructureBodySchema>;

const versionStatusSchema = Type.Union([
  Type.Literal('DRAFT'),
  Type.Literal('ACTIVE'),
  Type.Literal('SUPERSEDED')
]);

const termComponentResponseSchema = Type.Object({
  name: Type.String(),
  amount: Type.Integer()
});

const termResponseSchema = Type.Object({
  startDate: Type.String(),
  endDate: Type.String(),
  dueDate: Type.String(),
  paymentWindowOpenDate: Type.String(),
  components: Type.Array(termComponentResponseSchema)
});

const oneTimeCostResponseSchema = Type.Object({
  name: Type.String(),
  amount: Type.Integer()
});

const feeStructureAttributesSchema = Type.Object({
  courseId: Type.Integer(),
  categoryId: Type.Integer(),
  batchId: Type.Integer(),
  lineageId: Type.String({ description: 'Stable id shared by every version of this fee structure' }),
  versionId: Type.String({ description: 'id of this specific version' }),
  version: Type.Integer({ description: 'Sequential version number within the lineage' }),
  name: Type.String(),
  status: versionStatusSchema,
  lateFeePerDay: Type.Integer(),
  paymentWindowOffsetDays: Type.Integer(),
  dueDateOffsetDays: Type.Integer(),
  createdAt: Type.String({ description: 'ISO 8601 date-time' }),
  terms: Type.Array(termResponseSchema),
  oneTimeCosts: Type.Array(oneTimeCostResponseSchema),
  versions: Type.Array(Type.String(), { description: 'ids of every version in this lineage, oldest to newest' })
});

export const feeStructureResourceSchema = Type.Object({
  data: Type.Object({
    type: Type.Literal('fee-structure-details'),
    id: Type.String(),
    attributes: feeStructureAttributesSchema
  })
});

export type FeeStructureResource = Static<typeof feeStructureResourceSchema>;

export const createFeeStructureResponseSchema = feeStructureResourceSchema;

export type CreateFeeStructureResponse = FeeStructureResource;

const feeStructureVersionAttributesSchema = Type.Object({
  lineageId: Type.String({ description: 'Stable id of the fee structure this version belongs to' }),
  versionId: Type.String({ description: 'id of this specific version' }),
  name: Type.String(),
  status: versionStatusSchema,
  lateFeePerDay: Type.Integer(),
  paymentWindowOffsetDays: Type.Integer(),
  dueDateOffsetDays: Type.Integer(),
  createdAt: Type.String({ description: 'ISO 8601 date-time' }),
  terms: Type.Array(termResponseSchema),
  oneTimeCosts: Type.Array(oneTimeCostResponseSchema)
});

export const feeStructureVersionResourceSchema = Type.Object({
  data: Type.Object({
    type: Type.Literal('fee-structure-versions'),
    id: Type.String(),
    attributes: feeStructureVersionAttributesSchema
  })
});

export type FeeStructureVersionResource = Static<typeof feeStructureVersionResourceSchema>;

export const CreateFeeStructureSchema = {
  description:
    'Creates a new fee structure (course + category + batch) together with its first ACTIVE version, terms, and one-time costs.',
  tags: ['fee-structures'],
  body: createFeeStructureBodySchema,
  response: {
    201: createFeeStructureResponseSchema,
    400: errorResponseSchema,
    404: errorResponseSchema,
    409: errorResponseSchema
  }
};

export const getFeeStructureParamsSchema = Type.Object({
  id: Type.String({ pattern: '^[1-9][0-9]*$', description: 'Fee structure (lineage) id' })
});

export type GetFeeStructureParams = Static<typeof getFeeStructureParamsSchema>;

export type GetFeeStructureResponse = FeeStructureResource;

export const GetFeeStructureSchema = {
  description:
    'Returns the full detail of a fee structure: current version, all terms with their component breakdown, and one-time costs.',
  tags: ['fee-structures'],
  params: getFeeStructureParamsSchema,
  response: {
    200: feeStructureResourceSchema,
    400: errorResponseSchema,
    404: errorResponseSchema
  }
};

/**
 * Body for creating a new version of an existing fee structure. Identical to the create-fee-structure
 * body minus courseId/categoryId/batchId — those belong to the lineage and cannot change between versions.
 */
export const createFeeStructureVersionBodySchema = Type.Omit(createFeeStructureBodySchema, [
  'courseId',
  'categoryId',
  'batchId'
]);

export type CreateFeeStructureVersionBody = Static<typeof createFeeStructureVersionBodySchema>;

export type CreateFeeStructureVersionResponse = FeeStructureVersionResource;

export const CreateFeeStructureVersionSchema = {
  description:
    'Creates a new DRAFT version of an existing fee structure. The new version must be published before it becomes ACTIVE.',
  tags: ['fee-structures'],
  params: getFeeStructureParamsSchema,
  body: createFeeStructureVersionBodySchema,
  response: {
    201: feeStructureVersionResourceSchema,
    400: errorResponseSchema,
    404: errorResponseSchema,
    409: errorResponseSchema
  }
};

export const feeStructureVersionParamsSchema = Type.Object({
  id: Type.String({ pattern: '^[1-9][0-9]*$', description: 'Fee structure (lineage) id' }),
  versionId: Type.String({ pattern: '^[1-9][0-9]*$', description: 'Fee structure version id' })
});

export type FeeStructureVersionParams = Static<typeof feeStructureVersionParamsSchema>;

export type GetFeeStructureVersionResponse = FeeStructureVersionResource;

export const GetFeeStructureVersionSchema = {
  description:
    'Returns the full detail of a single fee structure version: its terms with their component breakdown and one-time costs.',
  tags: ['fee-structures'],
  params: feeStructureVersionParamsSchema,
  response: {
    200: feeStructureVersionResourceSchema,
    400: errorResponseSchema,
    404: errorResponseSchema
  }
};

export const DeleteFeeStructureVersionSchema = {
  description:
    'Deletes a fee structure version. Only versions that are not ACTIVE (DRAFT or SUPERSEDED) can be deleted.',
  tags: ['fee-structures'],
  params: feeStructureVersionParamsSchema,
  response: {
    204: Type.Null(),
    400: errorResponseSchema,
    404: errorResponseSchema,
    409: errorResponseSchema
  }
};

export type PublishFeeStructureVersionResponse = FeeStructureVersionResource;

export const PublishFeeStructureVersionSchema = {
  description:
    'Publishes a version: activates it and supersedes the currently ACTIVE version of the same lineage. Returns the newly ACTIVE version.',
  tags: ['fee-structures'],
  params: feeStructureVersionParamsSchema,
  response: {
    200: feeStructureVersionResourceSchema,
    400: errorResponseSchema,
    404: errorResponseSchema,
    409: errorResponseSchema
  }
};
