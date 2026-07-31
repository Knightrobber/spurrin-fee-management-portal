import { FeeStructureSearchRow } from '../../data/sql/repositories/fee-structures/fee-structure.searches.types';
import { SearchFeeStructuresResponse, SearchPageResponse } from './searches.schema';

type SearchResultResource = SearchFeeStructuresResponse['data'][number];
type SearchResultAttributes = SearchResultResource['attributes'];
type SearchFacets = SearchPageResponse['data']['attributes']['facets'];

function toSearchResultAttributes(row: FeeStructureSearchRow): SearchResultAttributes {
  const { batch, course, category } = row.feeStructure;

  return {
    name: row.name,
    courseName: course.name,
    categoryName: category.name,
    batchName: batch.name,
    batchYears: `${batch.startDate.getUTCFullYear()}-${batch.endDate.getUTCFullYear()}`,
    createdAt: row.createdAt.toISOString()
  };
}

/** Builds the JSON:API resource object for a single fee-structure search result. */
export function toSearchResultResource(row: FeeStructureSearchRow): SearchResultResource {
  return {
    type: 'fee-structures',
    id: row.feeStructureId.toString(),
    attributes: toSearchResultAttributes(row)
  };
}

/** Builds the faceted search response (results as relationships + included, facets, total count). */
export function toSearchPageResponse(
  rows: FeeStructureSearchRow[],
  facets: SearchFacets,
  totalCount: number
): SearchPageResponse {
  const included = rows.map(toSearchResultResource);

  return {
    data: {
      type: 'fee-structure-searches',
      attributes: { totalCount, facets },
      relationships: {
        'fee-structures': {
          data: included.map((resource) => ({ type: 'fee-structures', id: resource.id }))
        }
      }
    },
    included
  };
}

/** Builds the plain (non-faceted) paginated search response. */
export function toSearchFeeStructuresResponse(
  rows: FeeStructureSearchRow[]
): SearchFeeStructuresResponse {
  return { data: rows.map(toSearchResultResource) };
}
