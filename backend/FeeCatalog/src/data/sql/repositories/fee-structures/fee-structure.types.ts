import { VersionStatus } from '@prisma/client';

export interface CreateFeeStructureTermComponentData {
  name: string;
  amount: number;
}

export interface CreateFeeStructureTermData {
  startDate: Date;
  endDate: Date;
  dueDate: Date;
  paymentWindowOpenDate: Date;
  components: CreateFeeStructureTermComponentData[];
}

export interface CreateFeeStructureOneTimeCostData {
  name: string;
  amount: number;
}

export interface CreateFeeStructureVersionData {
  name: string;
  status: VersionStatus;
  lateFeePerDay: number;
  paymentWindowOffsetDays: number;
  dueDateOffsetDays: number;
  createdBy: bigint;
  terms: CreateFeeStructureTermData[];
  oneTimeCosts: CreateFeeStructureOneTimeCostData[];
}

/**
 * Plain domain shape for creating a fee structure + its first version. Callers
 * (services) build this; they never need to know about Prisma's nested `create`
 * blocks — `toPrismaCreateInput` in fee-structure.repository.ts is the only place
 * that translates it into what `dbClient.feeStructure.create()` actually needs.
 */
export interface CreateFeeStructureData {
  courseId: bigint;
  categoryId: bigint;
  batchId: bigint;
  versions: CreateFeeStructureVersionData[];
}
