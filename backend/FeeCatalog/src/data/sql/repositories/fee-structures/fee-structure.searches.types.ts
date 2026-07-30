import { Prisma, VersionStatus } from '@prisma/client';

/**
 * Filters applied when fetching the actual search results. `status` is always
 * resolved by the caller (defaults to ACTIVE when the client omits it). The
 * search term is matched (partial, case-insensitive) against the fee structure
 * version's `name`.
 */
export interface FeeStructureSearchFilters {
  searchTerm?: string;
  courseId?: bigint;
  categoryId?: bigint;
  batchId?: bigint;
  status: VersionStatus;
}

/**
 * Filters applied when computing the available filter options (facets). The
 * course/batch selections are intentionally excluded so each facet lists every
 * value the client could still narrow down to for the current search term.
 */
export interface FeeStructureFacetFilters {
  searchTerm?: string;
  status: VersionStatus;
}

export interface SearchPagination {
  offset: number;
  limit: number;
}

export interface FacetOption {
  id: string;
  name: string;
}

export interface SearchFacets {
  courses: FacetOption[];
  categories: FacetOption[];
  batches: FacetOption[];
}

/** A single search result row: only the fields the search response needs. */
export type FeeStructureSearchRow = Prisma.FeeStructureVersionGetPayload<{
  select: {
    name: true;
    createdAt: true;
    feeStructureId: true;
    feeStructure: {
      select: {
        course: { select: { name: true } };
        category: { select: { name: true } };
        batch: { select: { name: true; startDate: true; endDate: true } };
      };
    };
  };
}>;
