import { buildApp } from '../../app';
import * as coursesService from './courses.service';
import { CourseNotFoundError } from './courses.errors';
import { CourseListResponse, CourseResource } from './courses.schema';

jest.mock('./courses.service');

const validBody = { name: 'MBBS', durationYears: 5.5 };

const mockResource: CourseResource = {
  data: {
    type: 'courses',
    id: '1',
    attributes: { name: 'MBBS', durationYears: 5.5 }
  }
};

describe('POST /courses', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates a course and returns 201 with a Location header', async () => {
    jest.spyOn(coursesService, 'createCourse').mockResolvedValue(mockResource);

    const app = await buildApp();
    const response = await app.inject({ method: 'POST', url: '/courses', payload: validBody });

    expect(response.statusCode).toBe(201);
    expect(response.headers.location).toBe('/courses/1');
    expect(response.json()).toEqual(mockResource);
    expect(coursesService.createCourse).toHaveBeenCalledWith(validBody);

    await app.close();
  });

  it('returns 400 when the request body fails schema validation', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/courses',
      payload: { name: 'MBBS', durationYears: 0 }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().errors[0].code).toBe('VALIDATION_ERROR');

    await app.close();
  });
});

describe('GET /courses', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns the list of courses', async () => {
    const list: CourseListResponse = { data: [mockResource.data] };
    jest.spyOn(coursesService, 'listCourses').mockResolvedValue(list);

    const app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/courses' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(list);

    await app.close();
  });
});

describe('GET /courses/:id', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns a single course', async () => {
    jest.spyOn(coursesService, 'getCourseById').mockResolvedValue(mockResource);

    const app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/courses/1' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockResource);
    expect(coursesService.getCourseById).toHaveBeenCalledWith('1');

    await app.close();
  });

  it('returns 404 when the course does not exist', async () => {
    jest.spyOn(coursesService, 'getCourseById').mockRejectedValue(new CourseNotFoundError('99'));

    const app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/courses/99' });

    expect(response.statusCode).toBe(404);
    expect(response.json().errors[0].code).toBe('COURSE_NOT_FOUND');

    await app.close();
  });
});
