import { Prisma } from '@prisma/client';
import { dbClient } from '../../client';
import { FeeStructureConflictError, InvalidFeeStructureReferenceError } from './fee-structure.errors';
import { CreateFeeStructureData, CreateFeeStructureVersionData } from './fee-structure.types';

export type FeeStructureDetail = Prisma.FeeStructureGetPayload<{
  include: {
    versions: {
      include: {
        terms: { include: { components: true };};
        oneTimeCosts: true;
      };
    };
  };
}>;

export type FeeStructureVersionDetail = Prisma.FeeStructureVersionGetPayload<{
  include: {
    terms: { include: { components: true } };
    oneTimeCosts: true;
  };
}>;

export type { CreateFeeStructureData };

/** Translates the plain domain shape into the nested Prisma create input. */
function toPrismaCreateInput(data: CreateFeeStructureData): Prisma.FeeStructureUncheckedCreateInput {
  const version = data.versions[0];

  return {
    courseId: data.courseId,
    categoryId: data.categoryId,
    batchId: data.batchId,
    versions: {
      create: {
        name: version.name,
        status: version.status,
        lateFeePerDay: version.lateFeePerDay,
        paymentWindowOffsetDays: version.paymentWindowOffsetDays,
        dueDateOffsetDays: version.dueDateOffsetDays,
        createdBy: version.createdBy,
        terms: {
          create: version.terms.map((term) => ({
            startDate: term.startDate,
            endDate: term.endDate,
            dueDate: term.dueDate,
            paymentWindowOpenDate: term.paymentWindowOpenDate,
            components: { create: term.components }
          }))
        },
        oneTimeCosts: { create: version.oneTimeCosts }
      }
    }
  };
}

/**
 * Creates a new fee structure together with its first (ACTIVE) version, terms,
 * term components, and one-time costs in a single nested Prisma write.
 */
export async function createFeeStructureWithFirstVersion(
  data: CreateFeeStructureData
): Promise<FeeStructureDetail> {
  try {
    return await dbClient.feeStructure.create({
      data: toPrismaCreateInput(data),
      include: {
        versions: {
          include: {
            terms: { include: { components: true } },
            oneTimeCosts: true
          }
        }
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new FeeStructureConflictError(Number(data.courseId), Number(data.categoryId), Number(data.batchId));
      }
      if (error.code === 'P2003') {
        throw new InvalidFeeStructureReferenceError();
      }
    }
    throw error;
  }
}

/**
 * Fetches a fee structure (lineage) together with every version, its terms,
 * term components, and one-time costs. Returns `null` when no fee structure
 * with the given id exists.
 */
export async function findFeeStructureById(id: bigint): Promise<FeeStructureDetail | null> {
  return dbClient.feeStructure.findUnique({
    where: { id },
    relationLoadStrategy: 'join',
    include: {
      versions: {
        orderBy: { id: 'asc' },
        include: {
          terms: { include: { components: true }, orderBy: { startDate: 'asc' } },
          oneTimeCosts: true
        }
      }
    }
  });
}

/** Lightweight existence check for a fee structure (lineage) — does not load any versions. */
export async function feeStructureExists(id: bigint): Promise<boolean> {
  const feeStructure = await dbClient.feeStructure.findUnique({
    where: { id },
    select: { id: true }
  });

  return feeStructure !== null;
}

/**
 * Fetches a single version (with its terms, term components, and one-time costs) by its unique id.
 * Returns `null` when no version with that id exists.
 */
export async function findFeeStructureVersion(
  versionId: bigint
): Promise<FeeStructureVersionDetail | null> {
  return dbClient.feeStructureVersion.findUnique({
    where: { id: versionId },
    include: {
      terms: { include: { components: true }, orderBy: { startDate: 'asc' } },
      oneTimeCosts: true
    }
  });
}

/** Fetches the currently ACTIVE version of a fee structure lineage, or `null` when there isn't one. */
export async function findActiveFeeStructureVersion(
  feeStructureId: bigint
): Promise<FeeStructureVersionDetail | null> {
  return dbClient.feeStructureVersion.findFirst({
    where: { feeStructureId, status: 'ACTIVE' },
    include: {
      terms: { include: { components: true }, orderBy: { startDate: 'asc' } },
      oneTimeCosts: true
    }
  });
}

/** Builds the nested Prisma create input for a single version under an existing fee structure. */
function toPrismaVersionCreateInput(
  feeStructureId: bigint,
  version: CreateFeeStructureVersionData
): Prisma.FeeStructureVersionUncheckedCreateInput {
  return {
    feeStructureId,
    name: version.name,
    status: version.status,
    lateFeePerDay: version.lateFeePerDay,
    paymentWindowOffsetDays: version.paymentWindowOffsetDays,
    dueDateOffsetDays: version.dueDateOffsetDays,
    createdBy: version.createdBy,
    terms: {
      create: version.terms.map((term) => ({
        startDate: term.startDate,
        endDate: term.endDate,
        dueDate: term.dueDate,
        paymentWindowOpenDate: term.paymentWindowOpenDate,
        components: { create: term.components }
      }))
    },
    oneTimeCosts: { create: version.oneTimeCosts }
  };
}

/**
 * Creates a new version (with its terms, term components, and one-time costs) under an
 * existing fee structure lineage in a single nested Prisma write.
 */
export async function createFeeStructureVersion(
  feeStructureId: bigint,
  version: CreateFeeStructureVersionData
): Promise<FeeStructureVersionDetail> {
  try {
    return await dbClient.feeStructureVersion.create({
      data: toPrismaVersionCreateInput(feeStructureId, version),
      include: {
        terms: { include: { components: true }, orderBy: { startDate: 'asc' } },
        oneTimeCosts: true
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new InvalidFeeStructureReferenceError();
    }
    throw error;
  }
}

/**
 * Deletes a fee structure version together with its terms, term components, and one-time
 * costs. The foreign keys are ON DELETE RESTRICT, so children are removed first inside a
 * single transaction before the version itself.
 */
export async function deleteFeeStructureVersionById(versionId: bigint): Promise<void> {
  await dbClient.$transaction([
    dbClient.termComponent.deleteMany({ where: { term: { feeStructureVersionId: versionId } } }),
    dbClient.term.deleteMany({ where: { feeStructureVersionId: versionId } }),
    dbClient.oneTimeCost.deleteMany({ where: { feeStructureVersionId: versionId } }),
    dbClient.feeStructureVersion.delete({ where: { id: versionId } })
  ]);
}

/**
 * Publishes a version: supersedes the currently ACTIVE version(s) of its lineage and marks the
 * target version ACTIVE, in a single transaction. Callers must have already verified that
 * `versionId` belongs to `feeStructureId` (e.g. via `findFeeStructureVersion`) — this function
 * trusts that pairing and does not re-check it. Returns the newly activated version detail.
 */
export async function publishFeeStructureVersion(
  feeStructureId: bigint,
  versionId: bigint
): Promise<FeeStructureVersionDetail> {
  const [, activated] = await dbClient.$transaction([
    dbClient.feeStructureVersion.updateMany({
      where: { feeStructureId, status: 'ACTIVE', id: { not: versionId } },
      data: { status: 'SUPERSEDED' }
    }),
    dbClient.feeStructureVersion.update({
      where: { id: versionId },
      data: { status: 'ACTIVE' },
      include: {
        terms: { include: { components: true }, orderBy: { startDate: 'asc' } },
        oneTimeCosts: true
      }
    })
  ]);

  return activated;
}


