import { VersionStatus } from '@prisma/client';
import {
  countFeeStructureSearchResults,
  findFeeStructureSearchResults,
  getFeeStructureSearchFacets
} from '../../data/sql/repositories/fee-structures/fee-structure.searches.repository';
import { FeeStructureSearchFilters } from '../../data/sql/repositories/fee-structures/fee-structure.searches.types';
import {
  SearchFeeStructuresQuery,
  SearchFeeStructuresResponse,
  SearchPageQuery,
  SearchPageResponse
} from './searches.schema';
import { toSearchFeeStructuresResponse, toSearchPageResponse } from './searches.transformer';

const DEFAULT_STATUS: VersionStatus = 'ACTIVE';
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE_OFFSET = 0;

/**
 * Faceted search: computes the available filter options (facets) and total match
 * count from the base search (search term + status), then fetches the actual
 * page of results with every filter applied.
 */
export async function searchFeeStructurePage(query: SearchPageQuery): Promise<SearchPageResponse> {
  const filters = toFilters(query);
  const size = query['page[size]'] ?? DEFAULT_PAGE_SIZE;

  const [facets, totalCount, rows] = await Promise.all([
    getFeeStructureSearchFacets({ searchTerm: filters.searchTerm, status: filters.status }),
    countFeeStructureSearchResults(filters),
    findFeeStructureSearchResults(filters, { offset: DEFAULT_PAGE_OFFSET, limit: size })
  ]);

  return toSearchPageResponse(rows, facets, totalCount);
}

/** Paginated (offset/size) search that returns just the matching results. */
export async function searchFeeStructures(
  query: SearchFeeStructuresQuery
): Promise<SearchFeeStructuresResponse> {
  const filters = toFilters(query);
  const offset = query['page[offset]'] ?? DEFAULT_PAGE_OFFSET;
  const size = query['page[size]'] ?? DEFAULT_PAGE_SIZE;

  const rows = await findFeeStructureSearchResults(filters, { offset, limit: size });

  return toSearchFeeStructuresResponse(rows);
}

function toFilters(query: SearchPageQuery | SearchFeeStructuresQuery): FeeStructureSearchFilters {
  const courseId = query['filter[courseId]'];
  const categoryId = query['filter[categoryId]'];
  const batchId = query['filter[batchId]'];

  return {
    searchTerm: query['filter[searchTerm]'],
    courseId: courseId !== undefined ? BigInt(courseId) : undefined,
    categoryId: categoryId !== undefined ? BigInt(categoryId) : undefined,
    batchId: batchId !== undefined ? BigInt(batchId) : undefined,
    status: query['filter[status]'] ?? DEFAULT_STATUS
  };
}
