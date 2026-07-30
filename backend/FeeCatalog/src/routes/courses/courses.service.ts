import {
  createCourse as createCourseRecord,
  findAllCourses,
  findCourseById
} from '../../data/sql/repositories/courses/course.repository';
import { Course } from '../../data/sql/types/models.types';
import { CourseListResponse, CourseResource, CreateCourseBody } from './courses.schema';
import { CourseNotFoundError } from './courses.errors';

export async function createCourse(body: CreateCourseBody): Promise<CourseResource> {
  const created = await createCourseRecord({ name: body.name, durationYears: body.durationYears });
  return toCourseResource(created);
}

export async function listCourses(): Promise<CourseListResponse> {
  const courses = await findAllCourses();
  return { data: courses.map(toCourseResourceData) };
}

export async function getCourseById(id: string): Promise<CourseResource> {
  const course = await findCourseById(BigInt(id));

  if (!course) {
    throw new CourseNotFoundError(id);
  }

  return toCourseResource(course);
}

function toCourseResourceData(course: Course): CourseResource['data'] {
  return {
    type: 'courses',
    id: course.id.toString(),
    attributes: { name: course.name, durationYears: course.durationYears }
  };
}

function toCourseResource(course: Course): CourseResource {
  return { data: toCourseResourceData(course) };
}
