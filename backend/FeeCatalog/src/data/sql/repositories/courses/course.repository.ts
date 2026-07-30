import { Course } from '../../types/models.types';
import { dbClient } from '../../client';
import { CreateCourseData } from './course.types';

export type { CreateCourseData };

/** Creates a new course. */
export async function createCourse(data: CreateCourseData): Promise<Course> {
  return dbClient.course.create({
    data: { name: data.name, durationYears: data.durationYears }
  });
}

/** Returns every course, ordered by name. */
export async function findAllCourses(): Promise<Course[]> {
  return dbClient.course.findMany({ orderBy: { name: 'asc' } });
}

/** Returns the course with the given id, or `null` when none exists. */
export async function findCourseById(id: bigint): Promise<Course | null> {
  return dbClient.course.findUnique({ where: { id } });
}
