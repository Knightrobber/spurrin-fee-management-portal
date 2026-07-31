/**
 * Mock fee-catalog domain store. Mirrors the shapes in
 * backend/FeeCatalog (course/category/batch, fee-structure lineage + versions,
 * terms with cost components, one-time costs) but lives entirely client-side —
 * this prototype has no backend wiring. State is persisted to localStorage
 * (not just in memory) so that a fee-structure detail view opened in a new
 * browser window/tab reads the same data as the window that opened it, and
 * stays in sync when either side publishes, edits, or deletes a version.
 */

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
  createdBy: string;
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

export type FeeStructureListItem = {
  lineageId: string;
  courseId: string;
  courseName: string;
  categoryId: string;
  categoryName: string;
  batchId: string;
  batchName: string;
  versions: FeeStructureVersion[];
  active: FeeStructureVersion;
  draft?: FeeStructureVersion;
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

type StoreShape = {
  schemaVersion: number;
  courses: Course[];
  categories: Category[];
  batches: Batch[];
  lineages: FeeStructureLineage[];
};

export const STORAGE_KEY = "spurrin.feeCatalog.v1";
const SCHEMA_VERSION = 1;

/** The demo finance persona (mirrors AppShell's ROLE_PERSONS.finance). */
const CURRENT_FINANCE_USER = "Meera Desai";

export function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function seed(): StoreShape {
  const courses: Course[] = [
    { id: "course-mbbs", name: "MBBS", durationYears: 5.5 },
    { id: "course-md", name: "MD", durationYears: 3 },
    { id: "course-bsc-pharma", name: "BSc Pharma", durationYears: 4 },
    { id: "course-bsc-nursing", name: "BSc. Nursing", durationYears: 4 },
  ];

  const categories: Category[] = [
    { id: "cat-general", name: "General" },
    { id: "cat-sc", name: "SC" },
    { id: "cat-st", name: "ST" },
    { id: "cat-obc", name: "OBC" },
  ];

  const batches: Batch[] = [
    { id: "batch-2022", name: "Batch of 2022", startDate: "2022-08-01", endDate: "2026-07-31" },
    { id: "batch-2023", name: "Batch of 2023", startDate: "2023-08-01", endDate: "2027-07-31" },
    { id: "batch-2024", name: "Batch of 2024", startDate: "2024-08-01", endDate: "2028-07-31" },
  ];

  const lineages: FeeStructureLineage[] = [
    {
      lineageId: "fs-1",
      courseId: "course-mbbs",
      categoryId: "cat-general",
      batchId: "batch-2022",
      versions: [
        {
          versionId: "fs-1-v1",
          version: 1,
          name: "MBBS · General · Batch of 2022",
          status: "ACTIVE",
          lateFeePerDay: 50,
          paymentWindowOffsetDays: 30,
          dueDateOffsetDays: 18,
          createdAt: "2025-05-12T09:15:00.000Z",
          createdBy: CURRENT_FINANCE_USER,
          terms: [
            {
              id: "fs-1-v1-t1",
              startDate: "2025-08-01",
              endDate: "2025-12-31",
              dueDate: "2025-08-18",
              paymentWindowOpenDate: "2025-07-19",
              components: [
                { id: uid("c"), name: "Tuition", amount: 10000 },
                { id: uid("c"), name: "Examination", amount: 2000 },
                { id: uid("c"), name: "Clinical training", amount: 1000 },
              ],
            },
            {
              id: "fs-1-v1-t2",
              startDate: "2026-01-20",
              endDate: "2026-06-30",
              dueDate: "2026-02-05",
              paymentWindowOpenDate: "2025-12-21",
              components: [
                { id: uid("c"), name: "Tuition", amount: 10000 },
                { id: uid("c"), name: "Examination", amount: 2000 },
                { id: uid("c"), name: "Clinical training", amount: 1000 },
              ],
            },
          ],
          oneTimeCosts: [
            { id: uid("o"), name: "Admission / registration", amount: 40000 },
            { id: uid("o"), name: "Refundable deposit", amount: 10000 },
          ],
        },
      ],
    },
    {
      lineageId: "fs-2",
      courseId: "course-mbbs",
      categoryId: "cat-general",
      batchId: "batch-2023",
      versions: [
        {
          versionId: "fs-2-v1",
          version: 1,
          name: "MBBS · General · Batch of 2023",
          status: "ACTIVE",
          lateFeePerDay: 50,
          paymentWindowOffsetDays: 30,
          dueDateOffsetDays: 18,
          createdAt: "2025-04-03T10:00:00.000Z",
          createdBy: CURRENT_FINANCE_USER,
          terms: [
            {
              id: "fs-2-v1-t1",
              startDate: "2025-08-01",
              endDate: "2025-12-31",
              dueDate: "2025-08-18",
              paymentWindowOpenDate: "2025-07-19",
              components: [
                { id: uid("c"), name: "Tuition", amount: 10000 },
                { id: uid("c"), name: "Examination", amount: 2000 },
                { id: uid("c"), name: "Clinical training", amount: 1000 },
              ],
            },
            {
              id: "fs-2-v1-t2",
              startDate: "2026-01-20",
              endDate: "2026-06-30",
              dueDate: "2026-02-05",
              paymentWindowOpenDate: "2025-12-21",
              components: [
                { id: uid("c"), name: "Tuition", amount: 10000 },
                { id: uid("c"), name: "Examination", amount: 2000 },
                { id: uid("c"), name: "Clinical training", amount: 1000 },
              ],
            },
          ],
          oneTimeCosts: [
            { id: uid("o"), name: "Admission / registration", amount: 40000 },
            { id: uid("o"), name: "Refundable deposit", amount: 10000 },
          ],
        },
        {
          versionId: "fs-2-v2",
          version: 2,
          name: "MBBS · General · Batch of 2023",
          status: "DRAFT",
          lateFeePerDay: 75,
          paymentWindowOffsetDays: 30,
          dueDateOffsetDays: 18,
          createdAt: "2025-07-20T14:32:00.000Z",
          createdBy: CURRENT_FINANCE_USER,
          terms: [
            {
              id: "fs-2-v2-t1",
              startDate: "2025-08-01",
              endDate: "2025-12-31",
              dueDate: "2025-08-18",
              paymentWindowOpenDate: "2025-07-19",
              components: [
                { id: uid("c"), name: "Tuition", amount: 11000 },
                { id: uid("c"), name: "Examination", amount: 2000 },
                { id: uid("c"), name: "Clinical training", amount: 1000 },
                { id: uid("c"), name: "Hostel maintenance", amount: 1500 },
              ],
            },
            {
              id: "fs-2-v2-t2",
              startDate: "2026-01-20",
              endDate: "2026-06-30",
              dueDate: "2026-02-05",
              paymentWindowOpenDate: "2025-12-21",
              components: [
                { id: uid("c"), name: "Tuition", amount: 11000 },
                { id: uid("c"), name: "Examination", amount: 2000 },
                { id: uid("c"), name: "Clinical training", amount: 1000 },
                { id: uid("c"), name: "Hostel maintenance", amount: 1500 },
              ],
            },
          ],
          oneTimeCosts: [
            { id: uid("o"), name: "Admission / registration", amount: 40000 },
            { id: uid("o"), name: "Refundable deposit", amount: 10000 },
          ],
        },
      ],
    },
    {
      lineageId: "fs-3",
      courseId: "course-md",
      categoryId: "cat-general",
      batchId: "batch-2024",
      versions: [
        {
          versionId: "fs-3-v1",
          version: 1,
          name: "MD · General · Batch of 2024",
          status: "ACTIVE",
          lateFeePerDay: 75,
          paymentWindowOffsetDays: 30,
          dueDateOffsetDays: 18,
          createdAt: "2025-03-21T11:00:00.000Z",
          createdBy: CURRENT_FINANCE_USER,
          terms: [
            {
              id: "fs-3-v1-t1",
              startDate: "2024-08-01",
              endDate: "2024-12-31",
              dueDate: "2024-08-18",
              paymentWindowOpenDate: "2024-07-19",
              components: [
                { id: uid("c"), name: "Tuition", amount: 15000 },
                { id: uid("c"), name: "Examination", amount: 3000 },
                { id: uid("c"), name: "Thesis guidance", amount: 2000 },
              ],
            },
            {
              id: "fs-3-v1-t2",
              startDate: "2025-01-20",
              endDate: "2025-06-30",
              dueDate: "2025-02-05",
              paymentWindowOpenDate: "2024-12-21",
              components: [
                { id: uid("c"), name: "Tuition", amount: 15000 },
                { id: uid("c"), name: "Examination", amount: 3000 },
                { id: uid("c"), name: "Thesis guidance", amount: 2000 },
              ],
            },
          ],
          oneTimeCosts: [
            { id: uid("o"), name: "Admission / registration", amount: 60000 },
            { id: uid("o"), name: "Refundable deposit", amount: 15000 },
          ],
        },
      ],
    },
  ];

  return { schemaVersion: SCHEMA_VERSION, courses, categories, batches, lineages };
}

function isStoreShape(value: unknown): value is StoreShape {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<StoreShape>;
  return (
    v.schemaVersion === SCHEMA_VERSION &&
    Array.isArray(v.courses) &&
    Array.isArray(v.categories) &&
    Array.isArray(v.batches) &&
    Array.isArray(v.lineages)
  );
}

function readStore(): StoreShape {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = seed();
      writeStore(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw);
    if (!isStoreShape(parsed)) {
      const fresh = seed();
      writeStore(fresh);
      return fresh;
    }
    return parsed;
  } catch {
    const fresh = seed();
    writeStore(fresh);
    return fresh;
  }
}

function writeStore(store: StoreShape) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

// ---- Reads -----------------------------------------------------------

export function listCourses(): Course[] {
  return [...readStore().courses].sort((a, b) => a.name.localeCompare(b.name));
}

export function listCategories(): Category[] {
  return [...readStore().categories].sort((a, b) => a.name.localeCompare(b.name));
}

export function listBatches(): Batch[] {
  return [...readStore().batches].sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export function getLineage(lineageId: string): FeeStructureLineage | undefined {
  return readStore().lineages.find((l) => l.lineageId === lineageId);
}

export function getActiveVersion(lineage: FeeStructureLineage): FeeStructureVersion {
  return lineage.versions.find((v) => v.status === "ACTIVE") ?? lineage.versions[lineage.versions.length - 1];
}

export function listFeeStructures(): FeeStructureListItem[] {
  const store = readStore();
  const courseById = new Map(store.courses.map((c) => [c.id, c]));
  const categoryById = new Map(store.categories.map((c) => [c.id, c]));
  const batchById = new Map(store.batches.map((b) => [b.id, b]));

  return store.lineages
    .map((lineage) => {
      const active = getActiveVersion(lineage);
      const draft = [...lineage.versions].reverse().find((v) => v.status === "DRAFT");
      return {
        lineageId: lineage.lineageId,
        courseId: lineage.courseId,
        courseName: courseById.get(lineage.courseId)?.name ?? "Unknown course",
        categoryId: lineage.categoryId,
        categoryName: categoryById.get(lineage.categoryId)?.name ?? "Unknown category",
        batchId: lineage.batchId,
        batchName: batchById.get(lineage.batchId)?.name ?? "Unknown batch",
        versions: lineage.versions,
        active,
        draft,
      };
    })
    .sort((a, b) => b.active.createdAt.localeCompare(a.active.createdAt));
}

// ---- Entity creation ---------------------------------------------------

function assertUniqueName(existing: { name: string }[], name: string, kind: string) {
  if (existing.some((e) => e.name.trim().toLowerCase() === name.trim().toLowerCase())) {
    throw new Error(`${kind} "${name}" already exists`);
  }
}

export function createCourse(input: { name: string; durationYears: number }): Course {
  const store = readStore();
  assertUniqueName(store.courses, input.name, "Course");
  const course: Course = { id: uid("course"), name: input.name.trim(), durationYears: input.durationYears };
  store.courses.push(course);
  writeStore(store);
  return course;
}

export function createCategory(input: { name: string }): Category {
  const store = readStore();
  assertUniqueName(store.categories, input.name, "Category");
  const category: Category = { id: uid("cat"), name: input.name.trim() };
  store.categories.push(category);
  writeStore(store);
  return category;
}

export function createBatch(input: { name: string; startDate: string; endDate: string }): Batch {
  const store = readStore();
  assertUniqueName(store.batches, input.name, "Batch");
  const batch: Batch = {
    id: uid("batch"),
    name: input.name.trim(),
    startDate: input.startDate,
    endDate: input.endDate,
  };
  store.batches.push(batch);
  writeStore(store);
  return batch;
}

// ---- Fee-structure lifecycle -------------------------------------------

function buildVersion(input: FeeStructureInput, version: number, status: VersionStatus): FeeStructureVersion {
  return {
    versionId: uid("v"),
    version,
    name: input.name,
    status,
    lateFeePerDay: input.lateFeePerDay,
    paymentWindowOffsetDays: input.paymentWindowOffsetDays,
    dueDateOffsetDays: input.dueDateOffsetDays,
    createdAt: new Date().toISOString(),
    createdBy: CURRENT_FINANCE_USER,
    terms: input.terms.map((t) => ({
      id: uid("term"),
      startDate: t.startDate,
      endDate: t.endDate,
      dueDate: t.dueDate,
      paymentWindowOpenDate: t.paymentWindowOpenDate,
      components: t.components.map((c) => ({ id: uid("c"), name: c.name, amount: c.amount })),
    })),
    oneTimeCosts: input.oneTimeCosts.map((c) => ({ id: uid("o"), name: c.name, amount: c.amount })),
  };
}

export function createFeeStructure(
  input: FeeStructureInput & { courseId: string; categoryId: string; batchId: string }
): FeeStructureLineage {
  const store = readStore();
  const duplicate = store.lineages.find(
    (l) => l.courseId === input.courseId && l.categoryId === input.categoryId && l.batchId === input.batchId
  );
  if (duplicate) {
    throw new Error("A fee structure already exists for this course, category and batch combination.");
  }
  const lineage: FeeStructureLineage = {
    lineageId: uid("fs"),
    courseId: input.courseId,
    categoryId: input.categoryId,
    batchId: input.batchId,
    versions: [buildVersion(input, 1, "ACTIVE")],
  };
  store.lineages.push(lineage);
  writeStore(store);
  return lineage;
}

export function createDraftVersion(lineageId: string, input: FeeStructureInput): FeeStructureVersion {
  const store = readStore();
  const lineage = store.lineages.find((l) => l.lineageId === lineageId);
  if (!lineage) throw new Error("Fee structure not found");
  const version = buildVersion(input, lineage.versions.length + 1, "DRAFT");
  lineage.versions.push(version);
  writeStore(store);
  return version;
}

export function publishVersion(lineageId: string, versionId: string): FeeStructureVersion {
  const store = readStore();
  const lineage = store.lineages.find((l) => l.lineageId === lineageId);
  if (!lineage) throw new Error("Fee structure not found");
  const target = lineage.versions.find((v) => v.versionId === versionId);
  if (!target) throw new Error("Version not found");
  if (target.status !== "ACTIVE") {
    lineage.versions.forEach((v) => {
      if (v.status === "ACTIVE") v.status = "SUPERSEDED";
    });
    target.status = "ACTIVE";
    writeStore(store);
  }
  return target;
}

export function deleteVersion(lineageId: string, versionId: string): void {
  const store = readStore();
  const lineage = store.lineages.find((l) => l.lineageId === lineageId);
  if (!lineage) throw new Error("Fee structure not found");
  const target = lineage.versions.find((v) => v.versionId === versionId);
  if (!target) throw new Error("Version not found");
  if (target.status === "ACTIVE") throw new Error("Cannot delete the active version");
  lineage.versions = lineage.versions.filter((v) => v.versionId !== versionId);
  writeStore(store);
}

// ---- Derived helpers (pure, no storage access) --------------------------

export function computeAnnualTotal(version: FeeStructureVersion): number {
  return version.terms.reduce((sum, t) => sum + t.components.reduce((s, c) => s + c.amount, 0), 0);
}

export function computeOneTimeTotal(version: FeeStructureVersion): number {
  return version.oneTimeCosts.reduce((sum, c) => sum + c.amount, 0);
}

export function defaultFeeStructureName(courseName: string, categoryName: string, batchName: string): string {
  return `${courseName} · ${categoryName} · ${batchName}`;
}
