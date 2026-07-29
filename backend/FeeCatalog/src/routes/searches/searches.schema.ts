import { Type, Static } from '@sinclair/typebox';
import { errorResponseSchema } from '../../shared/schema/error-response.schema';

/** Filters shared by both search endpoints. */
const searchFilterProperties = {
  'filter[searchTerm]': Type.Optional(
    Type.String({ description: 'Free-text, partial (case-insensitive) match against the fee structure name.' })
  ),
  'filter[courseId]': Type.Optional(Type.Integer({ minimum: 1, description: 'Exact match, single course id.' })),
  'filter[categoryId]': Type.Optional(Type.Integer({ minimum: 1, description: 'Exact match, single category id.' })),
  'filter[batchId]': Type.Optional(Type.Integer({ minimum: 1, description: 'Exact match, single batch id.' })),
  'filter[status]': Type.Optional(
    Type.Union([Type.Literal('DRAFT'), Type.Literal('ACTIVE'), Type.Literal('SUPERSEDED')], {
      description: 'Version status to match. Defaults to ACTIVE when omitted.'
    })
  )
};

export const searchPageQuerySchema = Type.Object({
  ...searchFilterProperties,
  'page[size]': Type.Optional(
    Type.Integer({ minimum: 1, maximum: 200, default: 20, description: 'Maximum number of results to return.' })
  )
});

export type SearchPageQuery = Static<typeof searchPageQuerySchema>;

export const searchFeeStructuresQuerySchema = Type.Object({
  ...searchFilterProperties,
  'page[offset]': Type.Optional(Type.Integer({ minimum: 0, default: 0, description: 'Number of results to skip.' })),
  'page[size]': Type.Optional(
    Type.Integer({ minimum: 1, maximum: 200, default: 20, description: 'Maximum number of results to return.' })
  )
});

export type SearchFeeStructuresQuery = Static<typeof searchFeeStructuresQuerySchema>;

const facetOptionSchema = Type.Object({
  id: Type.String(),
  name: Type.String()
});

const searchResultAttributesSchema = Type.Object({
  name: Type.String({ description: 'Fee structure (version) name.' }),
  courseName: Type.String(),
  categoryName: Type.String(),
  batchName: Type.String(),
  batchYears: Type.String({ description: 'Batch start and end year, e.g. "2026-2027".' }),
  createdAt: Type.String({ description: 'ISO 8601 date-time' })
});

const searchResultResourceSchema = Type.Object({
  type: Type.Literal('fee-structures'),
  id: Type.String(),
  attributes: searchResultAttributesSchema
});

export const searchPageResponseSchema = Type.Object({
  data: Type.Object({
    type: Type.Literal('fee-structure-searches'),
    attributes: Type.Object({
      totalCount: Type.Integer({ description: 'Total number of results matching the filters.' }),
      facets: Type.Object({
        courses: Type.Array(facetOptionSchema),
        categories: Type.Array(facetOptionSchema),
        batches: Type.Array(facetOptionSchema)
      })
    }),
    relationships: Type.Object({
      'fee-structures': Type.Object({
        data: Type.Array(
          Type.Object({
            type: Type.Literal('fee-structures'),
            id: Type.String()
          })
        )
      })
    })
  }),
  included: Type.Array(searchResultResourceSchema)
});

export type SearchPageResponse = Static<typeof searchPageResponseSchema>;

export const searchFeeStructuresResponseSchema = Type.Object({
  data: Type.Array(searchResultResourceSchema)
});

export type SearchFeeStructuresResponse = Static<typeof searchFeeStructuresResponseSchema>;

export const SearchPageSchema = {
  description:
    'Runs a faceted search over fee structures: returns the matching results (as relationships/included resources), the available filter options (facets), and the total match count. Only page[size] is honoured — this endpoint is not offset-paginated.',
  tags: ['searches'],
  querystring: searchPageQuerySchema,
  response: {
    200: searchPageResponseSchema,
    400: errorResponseSchema
  }
};

export const SearchFeeStructuresSchema = {
  description:
    'Returns a paginated array of fee structure search results for the applied filters (no facets). Supports page[offset] and page[size].',
  tags: ['searches'],
  querystring: searchFeeStructuresQuerySchema,
  response: {
    200: searchFeeStructuresResponseSchema,
    400: errorResponseSchema
  }
};
