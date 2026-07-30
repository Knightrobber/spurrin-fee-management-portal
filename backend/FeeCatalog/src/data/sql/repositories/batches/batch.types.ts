/**
 * Plain domain shape for creating a batch. The service builds this; the
 * repository is the only place that translates it into the Prisma create input.
 */
export interface CreateBatchData {
  name: string;
  startDate: Date;
  endDate: Date;
}
