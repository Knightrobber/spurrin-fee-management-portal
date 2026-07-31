import { Course } from '../../data/sql/types/models.types';
import { CourseResource } from './courses.schema';

/** Builds the JSON:API resource object (`data`) for a single course. */
export function toCourseResourceData(course: Course): CourseResource['data'] {
  return {
    type: 'courses',
    id: course.id.toString(),
    attributes: { name: course.name, durationYears: course.durationYears }
  };
}

/** Wraps a single course in a top-level JSON:API document. */
export function toCourseResource(course: Course): CourseResource {
  return { data: toCourseResourceData(course) };
}
