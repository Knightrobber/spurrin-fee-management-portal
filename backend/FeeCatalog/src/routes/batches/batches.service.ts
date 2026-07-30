import {
  createBatch as createBatchRecord,
  findAllBatches,
  findBatchById
} from '../../data/sql/repositories/batches/batch.repository';
import { Batch } from '../../data/sql/types/models.types';
import { BatchListResponse, BatchResource, CreateBatchBody } from './batches.schema';
import { BatchNotFoundError, InvalidBatchDatesError } from './batches.errors';

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

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toBatchResourceData(batch: Batch): BatchResource['data'] {
  return {
    type: 'batches',
    id: batch.id.toString(),
    attributes: {
      name: batch.name,
      startDate: toIsoDate(batch.startDate),
      endDate: toIsoDate(batch.endDate)
    }
  };
}

function toBatchResource(batch: Batch): BatchResource {
  return { data: toBatchResourceData(batch) };
}
