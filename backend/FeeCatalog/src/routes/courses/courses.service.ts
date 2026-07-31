import {
  createCourse as createCourseRecord,
  findAllCourses,
  findCourseById
} from '../../data/sql/repositories/courses/course.repository';
import { CourseListResponse, CourseResource, CreateCourseBody } from './courses.schema';
import { CourseNotFoundError } from './courses.errors';
import { toCourseResource, toCourseResourceData } from './courses.transformer';

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
