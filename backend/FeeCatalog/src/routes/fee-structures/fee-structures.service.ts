import {
  createFeeStructureWithFirstVersion,
  findFeeStructureById,
  CreateFeeStructureData,
  FeeStructureDetail
} from '../../data/sql/repositories/fee-structures/fee-structure.repository';
import { CreateFeeStructureBody, CreateFeeStructureResponse } from './fee-structures.schema';
import { MissingFeeStructureOffsetsError, FeeStructureNotFoundError } from './fee-structures.errors';

// TODO: replace with the authenticated user's id once JWT auth is implemented.
const TEMP_SYSTEM_CREATED_BY = BigInt(1);

export async function createFeeStructure(
  body: CreateFeeStructureBody
): Promise<CreateFeeStructureResponse> {
  assertOffsetsProvidedWhenNeeded(body);

  const data: CreateFeeStructureData = {
    courseId: BigInt(body.courseId),
    categoryId: BigInt(body.categoryId),
    batchId: BigInt(body.batchId),
    versions: [
      {
        name: body.name,
        status: 'ACTIVE',
        lateFeePerDay: body.lateFeePerDay,
        paymentWindowOffsetDays: body.paymentWindowOffsetDays ?? 0,
        dueDateOffsetDays: body.dueDateOffsetDays ?? 0,
        createdBy: TEMP_SYSTEM_CREATED_BY,
        terms: body.terms.map((term) => {
          const startDate = new Date(term.startDate);
          return {
            startDate,
            endDate: new Date(term.endDate),
            dueDate: term.dueDate
              ? new Date(term.dueDate)
              : addDays(startDate, body.dueDateOffsetDays as number),
            paymentWindowOpenDate: term.paymentWindowOpenDate
              ? new Date(term.paymentWindowOpenDate)
              : addDays(startDate, body.paymentWindowOffsetDays as number),
            components: term.components
          };
        }),
        oneTimeCosts: body.oneTimeCosts ?? []
      }
    ]
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
 * paymentWindowOffsetDays/dueDateOffsetDays are only optional when every term supplies its
 * own absolute dueDate and paymentWindowOpenDate. If any term omits either, both offsets
 * are required so the missing dates can be derived from each term's startDate.
 */
function assertOffsetsProvidedWhenNeeded(body: CreateFeeStructureBody): void {
  const everyTermHasExplicitDates = body.terms.every((term) => term.dueDate && term.paymentWindowOpenDate);

  if (everyTermHasExplicitDates) {
    return;
  }

  if (body.paymentWindowOffsetDays === undefined || body.dueDateOffsetDays === undefined) {
    throw new MissingFeeStructureOffsetsError();
  }
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toFeeStructureResource(feeStructure: FeeStructureDetail): CreateFeeStructureResponse {
  // `versions` is ordered oldest-to-newest (see fee-structure.repository.ts), so the
  // current version is the last one, and its 1-based position is its sequential version number.
  const versions = feeStructure.versions;
  const version = versions[versions.length - 1];
  const versionNumber = versions.length;
  const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

  return {
    data: {
      type: 'fee-structures',
      id: feeStructure.id.toString(),
      attributes: {
        courseId: Number(feeStructure.courseId),
        categoryId: Number(feeStructure.categoryId),
        batchId: Number(feeStructure.batchId),
        lineageId: feeStructure.id.toString(),
        versionId: version.id.toString(),
        version: versionNumber,
        name: version.name,
        status: version.status,
        lateFeePerDay: version.lateFeePerDay,
        paymentWindowOffsetDays: version.paymentWindowOffsetDays,
        dueDateOffsetDays: version.dueDateOffsetDays,
        createdAt: version.createdAt.toISOString(),
        terms: version.terms.map((term) => ({
          startDate: toIsoDate(term.startDate),
          endDate: toIsoDate(term.endDate),
          dueDate: toIsoDate(term.dueDate),
          paymentWindowOpenDate: toIsoDate(term.paymentWindowOpenDate),
          components: term.components.map((component) => ({
            name: component.name,
            amount: component.amount
          }))
        })),
        oneTimeCosts: version.oneTimeCosts.map((cost) => ({
          name: cost.name,
          amount: cost.amount
        }))
      }
    }
  };
}

