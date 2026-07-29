import { buildApp } from '../../app';
import * as searchesService from './searches.service';
import { SearchFeeStructuresResponse, SearchPageResponse } from './searches.schema';

jest.mock('./searches.service');

const mockPageResponse: SearchPageResponse = {
  data: {
    type: 'fee-structure-searches',
    attributes: {
      totalCount: 1,
      facets: {
        courses: [{ id: '1', name: 'MBBS' }],
        categories: [{ id: '2', name: 'General' }],
        batches: [{ id: '3', name: '2026-27' }]
      }
    },
    relationships: {
      'fee-structures': {
        data: [{ type: 'fee-structures', id: '10' }]
      }
    }
  },
  included: [
    {
      type: 'fee-structures',
      id: '10',
      attributes: {
        name: 'MBBS 2026-27 v1',
        courseName: 'MBBS',
        categoryName: 'General',
        batchName: '2026-27',
        batchYears: '2026-2027',
        createdAt: '2026-07-25T00:00:00.000Z'
      }
    }
  ]
};

const mockListResponse: SearchFeeStructuresResponse = {
  data: [
    {
      type: 'fee-structures',
      id: '10',
      attributes: {
        name: 'MBBS 2026-27 v1',
        courseName: 'MBBS',
        categoryName: 'General',
        batchName: '2026-27',
        batchYears: '2026-2027',
        createdAt: '2026-07-25T00:00:00.000Z'
      }
    }
  ]
};

describe('GET /searches/page', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns 200 with facets, totalCount, and fee-structure relationships', async () => {
    jest.spyOn(searchesService, 'searchFeeStructurePage').mockResolvedValue(mockPageResponse);

    const app = await buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/searches/page?filter[searchTerm]=MBBS&filter[courseId]=1&page[size]=10'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockPageResponse);
    expect(searchesService.searchFeeStructurePage).toHaveBeenCalledWith({
      'filter[searchTerm]': 'MBBS',
      'filter[courseId]': 1,
      'page[size]': 10
    });

    await app.close();
  });

  it('returns 400 when a filter fails schema validation', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/searches/page?filter[courseId]=0'
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().errors[0].code).toBe('VALIDATION_ERROR');

    await app.close();
  });
});

describe('GET /searches/fee-structures', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns 200 with an array of fee-structure results', async () => {
    jest.spyOn(searchesService, 'searchFeeStructures').mockResolvedValue(mockListResponse);

    const app = await buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/searches/fee-structures?filter[batchId]=3&page[offset]=0&page[size]=20'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockListResponse);
    expect(searchesService.searchFeeStructures).toHaveBeenCalledWith({
      'filter[batchId]': 3,
      'page[offset]': 0,
      'page[size]': 20
    });

    await app.close();
  });
});
