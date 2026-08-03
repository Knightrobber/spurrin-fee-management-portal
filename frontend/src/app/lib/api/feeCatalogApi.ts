/**
 * Fee-catalog domain client. Mirrors the shapes the fee-structure screens use
 * (course/category/batch, fee-structure lineage + versions, terms with cost
 * components, one-time costs) but backs them with the FeeCatalog HTTP API
 * (see backend/FeeCatalog) instead of localStorage.
 */
import { ApiError, http } from "./httpClient";

export type VersionStatus = "DRAFT" | "ACTIVE" | "SUPERSEDED";

export type Course = { id: string; name: string; durationYears: number };
export type Category = { id: string; name: string };
export type Batch = { id: string; name: string; startDate: string; endDate: string };

export type CostLine = { id: string; name: string; amount: number };

export type Term = {
  id: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  paymentWindowOpenDate: string;
  components: CostLine[];
};

export type FeeStructureVersion = {
  versionId: string;
  version: number;
  name: string;
  status: VersionStatus;
  lateFeePerDay: number;
  paymentWindowOffsetDays: number;
  dueDateOffsetDays: number;
  createdAt: string;
  terms: Term[];
  oneTimeCosts: CostLine[];
};

export type FeeStructureLineage = {
  lineageId: string;
  courseId: string;
  categoryId: string;
  batchId: string;
  versions: FeeStructureVersion[];
};

/** A row from the fee-structure search endpoint. */
export type FeeStructureSearchItem = {
  lineageId: string;
  name: string;
  courseName: string;
  categoryName: string;
  batchName: string;
  batchYears: string;
  createdAt: string;
};

export type FacetOption = { id: string; name: string };

export type FeeStructureFacets = {
  courses: FacetOption[];
  categories: FacetOption[];
  batches: FacetOption[];
};

export type FeeStructureSearchPage = {
  items: FeeStructureSearchItem[];
  facets: FeeStructureFacets;
  totalCount: number;
};

export type TermInput = {
  startDate: string;
  endDate: string;
  dueDate: string;
  paymentWindowOpenDate: string;
  components: { name: string; amount: number }[];
};

export type FeeStructureInput = {
  name: string;
  lateFeePerDay: number;
  paymentWindowOffsetDays: number;
  dueDateOffsetDays: number;
  terms: TermInput[];
  oneTimeCosts: { name: string; amount: number }[];
};

export function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

// ---- Wire shapes (subset of the backend's JSON:API responses) ------------

type EntityResource<Attrs> = { data: { type: string; id: string; attributes: Attrs } };
type EntityListResource<Attrs> = { data: { type: string; id: string; attributes: Attrs }[] };

type CourseAttrs = { name: string; durationYears: number };
type CategoryAttrs = { name: string };
type BatchAttrs = { name: string; startDate: string; endDate: string };

type CostAttrs = { name: string; amount: number };
type TermAttrs = {
  startDate: string;
  endDate: string;
  dueDate: string;
  paymentWindowOpenDate: string;
  components: CostAttrs[];
};

type FeeStructureAttrs = {
  courseId: number;
  categoryId: number;
  batchId: number;
  lineageId: string;
  versionId: string;
  version: number;
  name: string;
  status: VersionStatus;
  lateFeePerDay: number;
  paymentWindowOffsetDays: number;
  dueDateOffsetDays: number;
  createdAt: string;
  terms: TermAttrs[];
  oneTimeCosts: CostAttrs[];
  versions: string[];
};

type FeeStructureVersionAttrs = Omit<FeeStructureAttrs, "courseId" | "categoryId" | "batchId" | "version" | "versions">;

type SearchResultAttrs = {
  name: string;
  courseName: string;
  categoryName: string;
  batchName: string;
  batchYears: string;
  createdAt: string;
};

// ---- Courses / categories / batches ---------------------------------------

export async function listCourses(): Promise<Course[]> {
  const res = await http.get<EntityListResource<CourseAttrs>>("/courses/");
  return res.data.map((d) => ({ id: d.id, name: d.attributes.name, durationYears: d.attributes.durationYears }));
}

export async function createCourse(input: { name: string; durationYears: number }): Promise<Course> {
  const res = await http.post<EntityResource<CourseAttrs>>("/courses/", input);
  return { id: res.data.id, name: res.data.attributes.name, durationYears: res.data.attributes.durationYears };
}

export async function getCourseById(id: string): Promise<Course> {
  const res = await http.get<EntityResource<CourseAttrs>>(`/courses/${id}`);
  return { id: res.data.id, name: res.data.attributes.name, durationYears: res.data.attributes.durationYears };
}

export async function listCategories(): Promise<Category[]> {
  const res = await http.get<EntityListResource<CategoryAttrs>>("/categories/");
  return res.data.map((d) => ({ id: d.id, name: d.attributes.name }));
}

export async function createCategory(input: { name: string }): Promise<Category> {
  const res = await http.post<EntityResource<CategoryAttrs>>("/categories/", input);
  return { id: res.data.id, name: res.data.attributes.name };
}

export async function getCategoryById(id: string): Promise<Category> {
  const res = await http.get<EntityResource<CategoryAttrs>>(`/categories/${id}`);
  return { id: res.data.id, name: res.data.attributes.name };
}

export async function listBatches(): Promise<Batch[]> {
  const res = await http.get<EntityListResource<BatchAttrs>>("/batches/");
  return res.data.map((d) => ({ id: d.id, name: d.attributes.name, startDate: d.attributes.startDate, endDate: d.attributes.endDate }));
}

export async function createBatch(input: { name: string; startDate: string; endDate: string }): Promise<Batch> {
  const res = await http.post<EntityResource<BatchAttrs>>("/batches/", input);
  return { id: res.data.id, name: res.data.attributes.name, startDate: res.data.attributes.startDate, endDate: res.data.attributes.endDate };
}

export async function getBatchById(id: string): Promise<Batch> {
  const res = await http.get<EntityResource<BatchAttrs>>(`/batches/${id}`);
  return { id: res.data.id, name: res.data.attributes.name, startDate: res.data.attributes.startDate, endDate: res.data.attributes.endDate };
}

// ---- Search / list ---------------------------------------------------------

export type FeeStructureFilters = {
  searchTerm?: string;
  courseId?: string;
  categoryId?: string;
  batchId?: string;
};

const DEFAULT_SEARCH_PAGE_SIZE = 20;

function setFilterParams(params: URLSearchParams, filters: FeeStructureFilters): void {
  if (filters.searchTerm?.trim()) params.set("filter[searchTerm]", filters.searchTerm.trim());
  if (filters.courseId) params.set("filter[courseId]", filters.courseId);
  if (filters.categoryId) params.set("filter[categoryId]", filters.categoryId);
  if (filters.batchId) params.set("filter[batchId]", filters.batchId);
  // filter[status] is intentionally omitted — the backend defaults to ACTIVE.
}

function toSearchItem(id: string, attrs: SearchResultAttrs): FeeStructureSearchItem {
  return {
    lineageId: id,
    name: attrs.name,
    courseName: attrs.courseName,
    categoryName: attrs.categoryName,
    batchName: attrs.batchName,
    batchYears: attrs.batchYears,
    createdAt: attrs.createdAt,
  };
}

type SearchPageResource = {
  data: { attributes: { totalCount: number; facets: FeeStructureFacets } };
  included: { id: string; attributes: SearchResultAttrs }[];
};

/**
 * Faceted search for the fee-structures list page: one call returns the matching
 * (ACTIVE) fee structures alongside the still-selectable course/category/batch
 * filter options, which narrow as `filters.searchTerm` changes.
 */
export async function searchFeeStructuresPage(filters: FeeStructureFilters = {}): Promise<FeeStructureSearchPage> {
  const params = new URLSearchParams();
  setFilterParams(params, filters);
  params.set("page[size]", String(DEFAULT_SEARCH_PAGE_SIZE));
  const res = await http.get<SearchPageResource>(`/searches/page?${params.toString()}`);
  return {
    items: res.included.map((row) => toSearchItem(row.id, row.attributes)),
    facets: res.data.attributes.facets,
    totalCount: res.data.attributes.totalCount,
  };
}

/** Plain (non-faceted) search, used by the clone-from-existing picker. */
export async function listFeeStructures(filters: FeeStructureFilters = {}): Promise<FeeStructureSearchItem[]> {
  const params = new URLSearchParams();
  setFilterParams(params, filters);
  params.set("page[size]", String(DEFAULT_SEARCH_PAGE_SIZE));
  const res = await http.get<{ data: { id: string; attributes: SearchResultAttrs }[] }>(
    `/searches/fee-structures?${params.toString()}`
  );
  return res.data.map((row) => toSearchItem(row.id, row.attributes));
}

// ---- Fee-structure lineage detail ------------------------------------------

function toCostLine(cost: CostAttrs, id: string): CostLine {
  return { id, name: cost.name, amount: cost.amount };
}

function toTerm(term: TermAttrs, id: string): Term {
  return {
    id,
    startDate: term.startDate,
    endDate: term.endDate,
    dueDate: term.dueDate,
    paymentWindowOpenDate: term.paymentWindowOpenDate,
    components: term.components.map((c, i) => toCostLine(c, `${id}-c${i}`)),
  };
}

function toVersion(
  attrs: FeeStructureAttrs | FeeStructureVersionAttrs,
  versionId: string,
  versionNumber: number
): FeeStructureVersion {
  return {
    versionId,
    version: versionNumber,
    name: attrs.name,
    status: attrs.status,
    lateFeePerDay: attrs.lateFeePerDay,
    paymentWindowOffsetDays: attrs.paymentWindowOffsetDays,
    dueDateOffsetDays: attrs.dueDateOffsetDays,
    createdAt: attrs.createdAt,
    terms: attrs.terms.map((t, i) => toTerm(t, `${versionId}-t${i}`)),
    oneTimeCosts: attrs.oneTimeCosts.map((c, i) => toCostLine(c, `${versionId}-o${i}`)),
  };
}

/**
 * Fetches a fee-structure lineage with every version's full detail. The
 * backend's `GET /fee-structures/:id` only returns the current version plus
 * the ids of every other version, so each of those is fetched individually
 * via `GET /fee-structures/:id/versions/:versionId`.
 */
export async function getLineage(lineageId: string): Promise<FeeStructureLineage | undefined> {
  const resource = await http.get<EntityResource<FeeStructureAttrs>>(`/fee-structures/${lineageId}`).catch((err) => {
    if (err instanceof ApiError && err.status === 404) return undefined;
    throw err;
  });
  if (!resource) return undefined;

  const attrs = resource.data.attributes;
  const otherVersionIds = attrs.versions.filter((id) => id !== attrs.versionId);
  const otherVersions = await Promise.all(
    otherVersionIds.map((versionId) =>
      http.get<EntityResource<FeeStructureVersionAttrs>>(`/fee-structures/${lineageId}/versions/${versionId}`)
    )
  );

  const versionById = new Map<string, FeeStructureVersion>();
  versionById.set(attrs.versionId, toVersion(attrs, attrs.versionId, attrs.versions.indexOf(attrs.versionId) + 1));
  otherVersions.forEach((res) => {
    const versionId = res.data.id;
    versionById.set(versionId, toVersion(res.data.attributes, versionId, attrs.versions.indexOf(versionId) + 1));
  });

  return {
    lineageId: resource.data.id,
    courseId: String(attrs.courseId),
    categoryId: String(attrs.categoryId),
    batchId: String(attrs.batchId),
    versions: attrs.versions.map((id) => versionById.get(id)!),
  };
}

export function getActiveVersion(lineage: FeeStructureLineage): FeeStructureVersion {
  return lineage.versions.find((v) => v.status === "ACTIVE") ?? lineage.versions[lineage.versions.length - 1];
}

// ---- Fee-structure lifecycle -----------------------------------------------

function toBody(input: FeeStructureInput) {
  return {
    name: input.name,
    lateFeePerDay: input.lateFeePerDay,
    paymentWindowOffsetDays: input.paymentWindowOffsetDays,
    dueDateOffsetDays: input.dueDateOffsetDays,
    terms: input.terms,
    oneTimeCosts: input.oneTimeCosts,
  };
}

export async function createFeeStructure(
  input: FeeStructureInput & { courseId: string; categoryId: string; batchId: string }
): Promise<{ lineageId: string }> {
  const body = {
    ...toBody(input),
    courseId: Number(input.courseId),
    categoryId: Number(input.categoryId),
    batchId: Number(input.batchId),
  };
  const res = await http.post<EntityResource<FeeStructureAttrs>>("/fee-structures/", body);
  return { lineageId: res.data.id };
}

export async function createDraftVersion(lineageId: string, input: FeeStructureInput): Promise<{ versionId: string }> {
  const res = await http.post<EntityResource<FeeStructureVersionAttrs>>(
    `/fee-structures/${lineageId}/versions`,
    toBody(input)
  );
  return { versionId: res.data.id };
}

export async function publishVersion(lineageId: string, versionId: string): Promise<void> {
  await http.post(`/fee-structures/${lineageId}/versions/${versionId}/publish`);
}

export async function deleteVersion(lineageId: string, versionId: string): Promise<void> {
  await http.delete(`/fee-structures/${lineageId}/versions/${versionId}`);
}

// ---- Derived helpers (pure, no network access) -----------------------------

export function computeTotal(version: FeeStructureVersion): number {
  return version.terms.reduce((sum, t) => sum + t.components.reduce((s, c) => s + c.amount, 0), 0);
}

export function computeOneTimeTotal(version: FeeStructureVersion): number {
  return version.oneTimeCosts.reduce((sum, c) => sum + c.amount, 0);
}

export function defaultFeeStructureName(courseName: string, categoryName: string, batchName: string): string {
  return `${courseName} · ${categoryName} · ${batchName}`;
}
