import { Prisma } from '@prisma/client';
import { dbClient } from '../../client';
import { FeeStructureConflictError, InvalidFeeStructureReferenceError } from './fee-structure.errors';
import { CreateFeeStructureData } from './fee-structure.types';

const feeStructureWithFirstVersionInclude = {
  versions: {
    include: {
      terms: { include: { components: true } },
      oneTimeCosts: true
    }
  }
} satisfies Prisma.FeeStructureInclude;

export type FeeStructureWithFirstVersion = Prisma.FeeStructureGetPayload<{
  include: typeof feeStructureWithFirstVersionInclude;
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
): Promise<FeeStructureWithFirstVersion> {
  try {
    return await dbClient.feeStructure.create({
      data: toPrismaCreateInput(data),
      include: feeStructureWithFirstVersionInclude
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


