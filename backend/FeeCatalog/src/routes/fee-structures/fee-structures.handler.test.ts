import { buildApp } from '../../app';
import * as feeStructuresService from './fee-structures.service';
import {
  FeeStructureConflictError,
  InvalidFeeStructureReferenceError
} from '../../data/sql/repositories/fee-structures/fee-structure.errors';
import { CreateFeeStructureResponse } from './fee-structures.schema';

jest.mock('./fee-structures.service');

const validBody = {
  courseId: 1,
  categoryId: 2,
  batchId: 3,
  name: 'MBBS 2026-27 v1',
  lateFeePerDay: 1000,
  paymentWindowOffsetDays: 30,
  dueDateOffsetDays: 30,
  terms: [
    {
      startDate: '2026-06-01',
      endDate: '2026-12-01',
      dueDate: '2026-07-01',
      paymentWindowOpenDate: '2026-06-01',
      components: [{ name: 'Tuition', amount: 675000 }]
    }
  ],
  oneTimeCosts: [{ name: 'Admission', amount: 29350 }]
};

const mockResource: CreateFeeStructureResponse = {
  data: {
    type: 'fee-structures',
    id: '1',
    attributes: {
      courseId: 1,
      categoryId: 2,
      batchId: 3,
      lineageId: '1',
      versionId: '1',
      version: 1,
      name: validBody.name,
      status: 'ACTIVE',
      lateFeePerDay: 1000,
      paymentWindowOffsetDays: 30,
      dueDateOffsetDays: 30,
      createdAt: '2026-07-25T00:00:00.000Z',
      terms: [
        {
          startDate: '2026-06-01',
          endDate: '2026-12-01',
          dueDate: '2026-07-01',
          paymentWindowOpenDate: '2026-06-01',
          components: [{ name: 'Tuition', amount: 675000 }]
        }
      ],
      oneTimeCosts: [{ name: 'Admission', amount: 29350 }]
    }
  }
};

describe('POST /fee-structures', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates a fee structure and returns 201 with a Location header', async () => {
    jest.spyOn(feeStructuresService, 'createFeeStructure').mockResolvedValue(mockResource);

    const app = await buildApp();
    const response = await app.inject({ method: 'POST', url: '/fee-structures', payload: validBody });

    expect(response.statusCode).toBe(201);
    expect(response.headers.location).toBe('/fee-structures/1');
    expect(response.json()).toEqual(mockResource);
    expect(feeStructuresService.createFeeStructure).toHaveBeenCalledWith(validBody);

    await app.close();
  });

  it('returns 400 when the request body fails schema validation', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/fee-structures',
      payload: { ...validBody, terms: [] }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().errors[0].code).toBe('VALIDATION_ERROR');

    await app.close();
  });

  it('returns 409 when a fee structure already exists for the course/category/batch', async () => {
    jest
      .spyOn(feeStructuresService, 'createFeeStructure')
      .mockRejectedValue(new FeeStructureConflictError(1, 2, 3));

    const app = await buildApp();
    const response = await app.inject({ method: 'POST', url: '/fee-structures', payload: validBody });

    expect(response.statusCode).toBe(409);
    expect(response.json().errors[0].code).toBe('FEE_STRUCTURE_ALREADY_EXISTS');

    await app.close();
  });

  it('returns 400 when courseId, categoryId, or batchId does not exist', async () => {
    jest
      .spyOn(feeStructuresService, 'createFeeStructure')
      .mockRejectedValue(new InvalidFeeStructureReferenceError());

    const app = await buildApp();
    const response = await app.inject({ method: 'POST', url: '/fee-structures', payload: validBody });

    expect(response.statusCode).toBe(400);
    expect(response.json().errors[0].code).toBe('INVALID_REFERENCE');

    await app.close();
  });
});
