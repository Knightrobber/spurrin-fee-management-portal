import { Batch } from '../../types/models.types';
import { dbClient } from '../../client';
import { CreateBatchData } from './batch.types';

export type { CreateBatchData };

/** Creates a new batch. */
export async function createBatch(data: CreateBatchData): Promise<Batch> {
  return dbClient.batch.create({
    data: { name: data.name, startDate: data.startDate, endDate: data.endDate }
  });
}

/** Returns every batch, ordered by start date descending (newest intake first). */
export async function findAllBatches(): Promise<Batch[]> {
  return dbClient.batch.findMany({ orderBy: { startDate: 'desc' } });
}

/** Returns the batch with the given id, or `null` when none exists. */
export async function findBatchById(id: bigint): Promise<Batch | null> {
  return dbClient.batch.findUnique({ where: { id } });
}
