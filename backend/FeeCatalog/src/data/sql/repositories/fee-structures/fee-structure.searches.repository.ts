import { Prisma } from "@prisma/client";
import { dbClient } from "../../client";
import { FeeStructureFacetFilters, FeeStructureSearchFilters, FeeStructureSearchRow, SearchFacets, SearchPagination } from "./fee-structure.searches.types";

/**
 * Builds the Prisma `where` for fee structure versions from the domain filters.
 * The search term is a partial, case-insensitive match against the version name;
 * course/category/batch are exact matches on the parent fee structure.
 */
function buildVersionWhere(filters: FeeStructureSearchFilters): Prisma.FeeStructureVersionWhereInput {
  const feeStructureWhere: Prisma.FeeStructureWhereInput = {};
  if (filters.courseId !== undefined) {
    feeStructureWhere.courseId = filters.courseId;
  }
  if (filters.categoryId !== undefined) {
    feeStructureWhere.categoryId = filters.categoryId;
  }
  if (filters.batchId !== undefined) {
    feeStructureWhere.batchId = filters.batchId;
  }

  return {
    status: filters.status,
    ...(filters.searchTerm ? { name: { contains: filters.searchTerm, mode: "insensitive" } } : {}),
    ...(Object.keys(feeStructureWhere).length > 0 ? { feeStructure: feeStructureWhere } : {}),
  };
}

/**
 * Fetches a page of search results (fee structure versions), selecting only the
 * fields the search response needs: version name, created date, lineage id, and
 * the parent's course/category/batch names (plus batch start/end dates for the
 * year range). Ordered newest first.
 */
export async function findFeeStructureSearchResults(
  filters: FeeStructureSearchFilters,
  pagination: SearchPagination,
): Promise<FeeStructureSearchRow[]> {
  return dbClient.feeStructureVersion.findMany({
    where: buildVersionWhere(filters),
    select: {
      name: true,
      createdAt: true,
      feeStructureId: true,
      feeStructure: {
        select: {
          course: { select: { name: true } },
          category: { select: { name: true } },
          batch: { select: { name: true, startDate: true, endDate: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: pagination.offset,
    take: pagination.limit,
  });
}

/** Counts every search result matching the filters (ignores pagination). */
export async function countFeeStructureSearchResults(filters: FeeStructureSearchFilters): Promise<number> {
  return dbClient.feeStructureVersion.count({ where: buildVersionWhere(filters) });
}

/**
 * Computes the available filter options (facets) for the current search term and
 * status: the distinct courses, categories, and batches that have at least one
 * matching fee structure version. Course/category/batch selections are not applied
 * here so every still-selectable option is returned.
 *
 * Queries each entity table directly for the options that have a matching version,
 * so the DB returns only the distinct, name-ordered options.
 */
export async function getFeeStructureSearchFacets(filters: FeeStructureFacetFilters): Promise<SearchFacets> {
  const matchingVersion = buildVersionWhere(filters);
  const where = { feeStructures: { some: { versions: { some: matchingVersion } } } };

  const [courses, categories, batches] = await Promise.all([
    dbClient.course.findMany({
      where,
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    dbClient.category.findMany({
      where,
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    dbClient.batch.findMany({
      where,
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    courses: courses.map((course) => ({ id: course.id.toString(), name: course.name })),
    categories: categories.map((category) => ({ id: category.id.toString(), name: category.name })),
    batches: batches.map((batch) => ({ id: batch.id.toString(), name: batch.name })),
  };
}
