import {
  createBatch as createBatchRecord,
  findAllBatches,
  findBatchById
} from '../../data/sql/repositories/batches/batch.repository';
import { BatchListResponse, BatchResource, CreateBatchBody } from './batches.schema';
import { BatchNotFoundError, InvalidBatchDatesError } from './batches.errors';
import { toBatchResource, toBatchResourceData } from './batches.transformer';

export async function createBatch(body: CreateBatchBody): Promise<BatchResource> {
  const startDate = new Date(body.startDate);
  const endDate = new Date(body.endDate);

  if (endDate < startDate) {
    throw new InvalidBatchDatesError();
  }

  const created = await createBatchRecord({ name: body.name, startDate, endDate });
  return toBatchResource(created);
}

export async function listBatches(): Promise<BatchListResponse> {
  const batches = await findAllBatches();
  return { data: batches.map(toBatchResourceData) };
}

export async function getBatchById(id: string): Promise<BatchResource> {
  const batch = await findBatchById(BigInt(id));

  if (!batch) {
    throw new BatchNotFoundError(id);
  }

  return toBatchResource(batch);
}
