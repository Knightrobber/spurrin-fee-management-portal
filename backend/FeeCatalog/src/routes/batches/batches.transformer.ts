import { Batch } from '../../data/sql/types/models.types';
import { BatchResource } from './batches.schema';

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Builds the JSON:API resource object (`data`) for a single batch. */
export function toBatchResourceData(batch: Batch): BatchResource['data'] {
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

/** Wraps a single batch in a top-level JSON:API document. */
export function toBatchResource(batch: Batch): BatchResource {
  return { data: toBatchResourceData(batch) };
}
