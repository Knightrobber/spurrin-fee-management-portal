import {
  createFeeStructureWithFirstVersion,
  createFeeStructureVersion as createFeeStructureVersionRecord,
  deleteFeeStructureVersionById,
  publishFeeStructureVersion as publishFeeStructureVersionRecord,
  findFeeStructureById,
  feeStructureExists,
  findFeeStructureVersion,
  findActiveFeeStructureVersion,
  CreateFeeStructureData
} from '../../data/sql/repositories/fee-structures/fee-structure.repository';
import { CreateFeeStructureVersionData } from '../../data/sql/repositories/fee-structures/fee-structure.types';
import { findCourseById } from '../../data/sql/repositories/courses/course.repository';
import { findCategoryById } from '../../data/sql/repositories/categories/category.repository';
import { findBatchById } from '../../data/sql/repositories/batches/batch.repository';
import { CourseNotFoundError } from '../courses/courses.errors';
import { CategoryNotFoundError } from '../categories/categories.errors';
import { BatchNotFoundError } from '../batches/batches.errors';
import { toFeeStructureResource, toFeeStructureVersionResource } from './fee-structures.transformer';
import {
  CreateFeeStructureBody,
  CreateFeeStructureResponse,
  CreateFeeStructureVersionBody,
  FeeStructureVersionResource
} from './fee-structures.schema';
import {
  MissingFeeStructureOffsetsError,
  FeeStructureNotFoundError,
  FeeStructureVersionNotFoundError,
  ActiveFeeStructureVersionDeletionError,
  FeeStructureVersionAlreadyActiveError,
  UnchangedFeeStructureVersionError
} from './fee-structures.errors';

// TODO: replace with the authenticated user's id once JWT auth is implemented.
const TEMP_SYSTEM_CREATED_BY = BigInt(1);

export async function createFeeStructure(
  body: CreateFeeStructureBody
): Promise<CreateFeeStructureResponse> {
  assertOffsetsProvidedWhenNeeded(body);

  await assertReferencesExist(body.courseId, body.categoryId, body.batchId);

  const data: CreateFeeStructureData = {
    courseId: BigInt(body.courseId),
    categoryId: BigInt(body.categoryId),
    batchId: BigInt(body.batchId),
    versions: [toVersionData(body, 'ACTIVE')]
  };

  const created = await createFeeStructureWithFirstVersion(data);

  return toFeeStructureResource(created);
}

/**
 * Fetches the full detail of a fee structure by its lineage id: the current
 * (most recently published) version, all of its terms with their component
 * breakdown, and its one-time costs.
 */
export async function getFeeStructureById(id: string): Promise<CreateFeeStructureResponse> {
  const feeStructure = await findFeeStructureById(BigInt(id));

  if (!feeStructure) {
    throw new FeeStructureNotFoundError(id);
  }

  return toFeeStructureResource(feeStructure);
}

/**
 * Creates a new DRAFT version of an existing fee structure lineage. The course/category/batch
 * are inherited from the lineage; only the version-level fields come from the body. The new
 * version must be published before it becomes ACTIVE.
 */
export async function createFeeStructureVersion(
  id: string,
  body: CreateFeeStructureVersionBody
): Promise<FeeStructureVersionResource> {
  const feeStructureId = BigInt(id);

  if (!(await feeStructureExists(feeStructureId))) {
    throw new FeeStructureNotFoundError(id);
  }

  assertOffsetsProvidedWhenNeeded(body);

  const newVersion = toVersionData(body, 'DRAFT');

  // A new version is only created when it differs from the currently ACTIVE version.
  const activeVersion = await findActiveFeeStructureVersion(feeStructureId);
  if (activeVersion && versionsAreEquivalent(newVersion, activeVersion)) {
    throw new UnchangedFeeStructureVersionError(id);
  }

  const createdVersion = await createFeeStructureVersionRecord(feeStructureId, newVersion);

  return toFeeStructureVersionResource(createdVersion);
}

/** Returns the full detail of a single version within a fee structure lineage. */
export async function getFeeStructureVersion(
  id: string,
  versionId: string
): Promise<FeeStructureVersionResource> {
  const feeStructureId = BigInt(id);

  if (!(await feeStructureExists(feeStructureId))) {
    throw new FeeStructureNotFoundError(id);
  }

  const version = await findFeeStructureVersion(BigInt(versionId));

  if (!version || version.feeStructureId !== feeStructureId) {
    throw new FeeStructureVersionNotFoundError(id, versionId);
  }

  return toFeeStructureVersionResource(version);
}

/** Deletes a version if it is not ACTIVE (i.e. DRAFT or SUPERSEDED). */
export async function deleteFeeStructureVersion(id: string, versionId: string): Promise<void> {
  const feeStructureId = BigInt(id);

  if (!(await feeStructureExists(feeStructureId))) {
    throw new FeeStructureNotFoundError(id);
  }

  const version = await findFeeStructureVersion(BigInt(versionId));

  if (!version || version.feeStructureId !== feeStructureId) {
    throw new FeeStructureVersionNotFoundError(id, versionId);
  }

  if (version.status === 'ACTIVE') {
    throw new ActiveFeeStructureVersionDeletionError(id, versionId);
  }

  await deleteFeeStructureVersionById(version.id);
}

/**
 * Publishes a version: activates it and supersedes the lineage's currently ACTIVE version.
 * Returns the newly ACTIVE version document.
 */
export async function publishFeeStructureVersion(
  id: string,
  versionId: string
): Promise<FeeStructureVersionResource> {
  const feeStructureId = BigInt(id);

  if (!(await feeStructureExists(feeStructureId))) {
    throw new FeeStructureNotFoundError(id);
  }

  const version = await findFeeStructureVersion(BigInt(versionId));

  if (!version || version.feeStructureId !== feeStructureId) {
    throw new FeeStructureVersionNotFoundError(id, versionId);
  }

  if (version.status === 'ACTIVE') {
    throw new FeeStructureVersionAlreadyActiveError(id, versionId);
  }

  const activated = await publishFeeStructureVersionRecord(feeStructureId, version.id);

  return toFeeStructureVersionResource(activated);
}

/** Builds the plain domain version data shared by create-fee-structure and create-version. */
function toVersionData(
  body: CreateFeeStructureBody | CreateFeeStructureVersionBody,
  status: CreateFeeStructureVersionData['status']
): CreateFeeStructureVersionData {
  return {
    name: body.name,
    status,
    lateFeePerDay: body.lateFeePerDay,
    paymentWindowOffsetDays: body.paymentWindowOffsetDays ?? 0,
    dueDateOffsetDays: body.dueDateOffsetDays ?? 0,
    createdBy: TEMP_SYSTEM_CREATED_BY,
    terms: body.terms.map((term) => {
      const startDate = new Date(term.startDate);
      return {
        startDate,
        endDate: new Date(term.endDate),
        dueDate: term.dueDate ? new Date(term.dueDate) : addDays(startDate, body.dueDateOffsetDays as number),
        paymentWindowOpenDate: term.paymentWindowOpenDate
          ? new Date(term.paymentWindowOpenDate)
          : addDays(startDate, body.paymentWindowOffsetDays as number),
        components: term.components
      };
    }),
    oneTimeCosts: body.oneTimeCosts ?? []
  };
}

/**
 * paymentWindowOffsetDays/dueDateOffsetDays are only optional when every term supplies its
 * own absolute dueDate and paymentWindowOpenDate. If any term omits either, both offsets
 * are required so the missing dates can be derived from each term's startDate.
 */
function assertOffsetsProvidedWhenNeeded(
  body: CreateFeeStructureBody | CreateFeeStructureVersionBody
): void {
  const everyTermHasExplicitDates = body.terms.every((term) => term.dueDate && term.paymentWindowOpenDate);

  if (everyTermHasExplicitDates) {
    return;
  }

  if (body.paymentWindowOffsetDays === undefined || body.dueDateOffsetDays === undefined) {
    throw new MissingFeeStructureOffsetsError();
  }
}

/** Verifies the referenced course, category, and batch all exist before a fee structure is created. */
async function assertReferencesExist(
  courseId: number,
  categoryId: number,
  batchId: number
): Promise<void> {
  const [course, category, batch] = await Promise.all([
    findCourseById(BigInt(courseId)),
    findCategoryById(BigInt(categoryId)),
    findBatchById(BigInt(batchId))
  ]);

  if (!course) {
    throw new CourseNotFoundError(String(courseId));
  }
  if (!category) {
    throw new CategoryNotFoundError(String(categoryId));
  }
  if (!batch) {
    throw new BatchNotFoundError(String(batchId));
  }
}

interface ComparableVersion {
  name: string;
  lateFeePerDay: number;
  paymentWindowOffsetDays: number;
  dueDateOffsetDays: number;
  terms: Array<{
    startDate: Date;
    endDate: Date;
    dueDate: Date;
    paymentWindowOpenDate: Date;
    components: Array<{ name: string; amount: number }>;
  }>;
  oneTimeCosts: Array<{ name: string; amount: number }>;
}

/**
 * Returns true when two versions carry the same user-editable content: name, late fee, offsets,
 * terms with their component breakdown, and one-time costs. Ordering of terms/components/costs is
 * ignored, as is version metadata (status, ids, createdAt/createdBy).
 */
function versionsAreEquivalent(a: ComparableVersion, b: ComparableVersion): boolean {
  return canonicalizeVersion(a) === canonicalizeVersion(b);
}

function canonicalizeVersion(version: ComparableVersion): string {
  const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);
  const byNameAmount = (
    x: { name: string; amount: number },
    y: { name: string; amount: number }
  ): number => x.name.localeCompare(y.name) || x.amount - y.amount;

  const terms = version.terms
    .map((term) => ({
      startDate: toIsoDate(term.startDate),
      endDate: toIsoDate(term.endDate),
      dueDate: toIsoDate(term.dueDate),
      paymentWindowOpenDate: toIsoDate(term.paymentWindowOpenDate),
      components: term.components.map((c) => ({ name: c.name, amount: c.amount })).sort(byNameAmount)
    }))
    .sort(
      (x, y) =>
        x.startDate.localeCompare(y.startDate) ||
        x.endDate.localeCompare(y.endDate) ||
        x.dueDate.localeCompare(y.dueDate) ||
        x.paymentWindowOpenDate.localeCompare(y.paymentWindowOpenDate)
    );

  const oneTimeCosts = version.oneTimeCosts
    .map((c) => ({ name: c.name, amount: c.amount }))
    .sort(byNameAmount);

  return JSON.stringify({
    name: version.name,
    lateFeePerDay: version.lateFeePerDay,
    paymentWindowOffsetDays: version.paymentWindowOffsetDays,
    dueDateOffsetDays: version.dueDateOffsetDays,
    terms,
    oneTimeCosts
  });
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

