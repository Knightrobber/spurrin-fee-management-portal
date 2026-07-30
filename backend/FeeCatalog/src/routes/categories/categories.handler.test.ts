import { buildApp } from '../../app';
import * as categoriesService from './categories.service';
import { CategoryNotFoundError } from './categories.errors';
import { CategoryListResponse, CategoryResource } from './categories.schema';

jest.mock('./categories.service');

const mockResource: CategoryResource = {
  data: {
    type: 'categories',
    id: '1',
    attributes: { name: 'Management' }
  }
};

describe('POST /categories', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates a category and returns 201 with a Location header', async () => {
    jest.spyOn(categoriesService, 'createCategory').mockResolvedValue(mockResource);

    const app = await buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/categories',
      payload: { name: 'Management' }
    });

    expect(response.statusCode).toBe(201);
    expect(response.headers.location).toBe('/categories/1');
    expect(response.json()).toEqual(mockResource);
    expect(categoriesService.createCategory).toHaveBeenCalledWith({ name: 'Management' });

    await app.close();
  });

  it('returns 400 when the request body fails schema validation', async () => {
    const app = await buildApp();

    const response = await app.inject({ method: 'POST', url: '/categories', payload: { name: '' } });

    expect(response.statusCode).toBe(400);
    expect(response.json().errors[0].code).toBe('VALIDATION_ERROR');

    await app.close();
  });
});

describe('GET /categories', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns the list of categories', async () => {
    const list: CategoryListResponse = { data: [mockResource.data] };
    jest.spyOn(categoriesService, 'listCategories').mockResolvedValue(list);

    const app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/categories' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(list);

    await app.close();
  });
});

describe('GET /categories/:id', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns a single category', async () => {
    jest.spyOn(categoriesService, 'getCategoryById').mockResolvedValue(mockResource);

    const app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/categories/1' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockResource);
    expect(categoriesService.getCategoryById).toHaveBeenCalledWith('1');

    await app.close();
  });

  it('returns 404 when the category does not exist', async () => {
    jest.spyOn(categoriesService, 'getCategoryById').mockRejectedValue(new CategoryNotFoundError('99'));

    const app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/categories/99' });

    expect(response.statusCode).toBe(404);
    expect(response.json().errors[0].code).toBe('CATEGORY_NOT_FOUND');

    await app.close();
  });
});
