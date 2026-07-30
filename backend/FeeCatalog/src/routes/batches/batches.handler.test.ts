import { buildApp } from '../../app';
import * as batchesService from './batches.service';
import { BatchNotFoundError } from './batches.errors';
import { BatchListResponse, BatchResource } from './batches.schema';

jest.mock('./batches.service');

const validBody = { name: 'MBBS 2026-27', startDate: '2026-06-01', endDate: '2031-05-31' };

const mockResource: BatchResource = {
  data: {
    type: 'batches',
    id: '1',
    attributes: { name: 'MBBS 2026-27', startDate: '2026-06-01', endDate: '2031-05-31' }
  }
};

describe('POST /batches', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates a batch and returns 201 with a Location header', async () => {
    jest.spyOn(batchesService, 'createBatch').mockResolvedValue(mockResource);

    const app = await buildApp();
    const response = await app.inject({ method: 'POST', url: '/batches', payload: validBody });

    expect(response.statusCode).toBe(201);
    expect(response.headers.location).toBe('/batches/1');
    expect(response.json()).toEqual(mockResource);
    expect(batchesService.createBatch).toHaveBeenCalledWith(validBody);

    await app.close();
  });

  it('returns 400 when the request body fails schema validation', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/batches',
      payload: { name: '', startDate: '2026-06-01', endDate: '2031-05-31' }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().errors[0].code).toBe('VALIDATION_ERROR');

    await app.close();
  });
});

describe('GET /batches', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns the list of batches', async () => {
    const list: BatchListResponse = { data: [mockResource.data] };
    jest.spyOn(batchesService, 'listBatches').mockResolvedValue(list);

    const app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/batches' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(list);

    await app.close();
  });
});

describe('GET /batches/:id', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns a single batch', async () => {
    jest.spyOn(batchesService, 'getBatchById').mockResolvedValue(mockResource);

    const app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/batches/1' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockResource);
    expect(batchesService.getBatchById).toHaveBeenCalledWith('1');

    await app.close();
  });

  it('returns 404 when the batch does not exist', async () => {
    jest.spyOn(batchesService, 'getBatchById').mockRejectedValue(new BatchNotFoundError('99'));

    const app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/batches/99' });

    expect(response.statusCode).toBe(404);
    expect(response.json().errors[0].code).toBe('BATCH_NOT_FOUND');

    await app.close();
  });
});
