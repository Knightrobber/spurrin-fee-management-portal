import {
  FeeStructureDetail,
  FeeStructureVersionDetail
} from '../../data/sql/repositories/fee-structures/fee-structure.repository';
import { FeeStructureResource, FeeStructureVersionResource } from './fee-structures.schema';

const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

/**
 * Builds the full fee structure resource (course/category/batch + a single version's detail and
 * the list of every version id in the lineage). When `targetVersionId` is given that version is
 * rendered; otherwise the ACTIVE version is preferred, falling back to the most recent one.
 */
export function toFeeStructureResource(
  feeStructure: FeeStructureDetail,
  targetVersionId?: bigint
): FeeStructureResource {
  const versions = feeStructure.versions;
  let versionIndex: number;
  if (targetVersionId !== undefined) {
    versionIndex = versions.findIndex((v) => v.id === targetVersionId);
  } else {
    const activeVersionIndex = versions.findIndex((v) => v.status === 'ACTIVE');
    versionIndex = activeVersionIndex !== -1 ? activeVersionIndex : versions.length - 1;
  }
  const version = versions[versionIndex];
  const versionNumber = versionIndex + 1;

  return {
    data: {
      type: 'fee-structure-details',
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
        })),
        versions: versions.map((v) => v.id.toString())
      }
    }
  };
}

/** Builds a single fee structure version document (JSON:API resource) from the version alone. */
export function toFeeStructureVersionResource(
  version: FeeStructureVersionDetail
): FeeStructureVersionResource {
  return {
    data: {
      type: 'fee-structure-versions',
      id: version.id.toString(),
      attributes: {
        lineageId: version.feeStructureId.toString(),
        versionId: version.id.toString(),
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
