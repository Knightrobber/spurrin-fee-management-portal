import { VersionStatus } from '@prisma/client';
import {
  countFeeStructureSearchResults,
  findFeeStructureSearchResults,
  getFeeStructureSearchFacets
} from '../../data/sql/repositories/searches/search.repository';
import {
  FeeStructureSearchFilters,
  FeeStructureSearchRow
} from '../../data/sql/repositories/searches/search.types';
import {
  SearchFeeStructuresQuery,
  SearchFeeStructuresResponse,
  SearchPageQuery,
  SearchPageResponse
} from './searches.schema';

const DEFAULT_STATUS: VersionStatus = 'ACTIVE';
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE_OFFSET = 0;

type SearchResultAttributes = SearchFeeStructuresResponse['data'][number]['attributes'];

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

  const included = rows.map((row) => ({
    type: 'fee-structures' as const,
    id: row.feeStructureId.toString(),
    attributes: toAttributes(row)
  }));

  return {
    data: {
      type: 'fee-structure-searches',
      attributes: { totalCount, facets },
      relationships: {
        'fee-structures': {
          data: included.map((resource) => ({ type: 'fee-structures' as const, id: resource.id }))
        }
      }
    },
    included
  };
}

/** Paginated (offset/size) search that returns just the matching results. */
export async function searchFeeStructures(
  query: SearchFeeStructuresQuery
): Promise<SearchFeeStructuresResponse> {
  const filters = toFilters(query);
  const offset = query['page[offset]'] ?? DEFAULT_PAGE_OFFSET;
  const size = query['page[size]'] ?? DEFAULT_PAGE_SIZE;

  const rows = await findFeeStructureSearchResults(filters, { offset, limit: size });

  return {
    data: rows.map((row) => ({
      type: 'fee-structures' as const,
      id: row.feeStructureId.toString(),
      attributes: toAttributes(row)
    }))
  };
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

function toAttributes(row: FeeStructureSearchRow): SearchResultAttributes {
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
