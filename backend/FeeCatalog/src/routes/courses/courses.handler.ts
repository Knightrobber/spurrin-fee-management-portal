import { FastifyReply, FastifyRequest } from 'fastify';
import {
  CourseListResponse,
  CourseResource,
  CreateCourseBody,
  GetCourseParams
} from './courses.schema';
import { createCourse, getCourseById, listCourses } from './courses.service';

export async function postCourseHandler(
  request: FastifyRequest<{ Body: CreateCourseBody }>,
  reply: FastifyReply
): Promise<CourseResource> {
  const resource = await createCourse(request.body);

  reply.header('Location', `/courses/${resource.data.id}`);
  reply.code(201);

  return resource;
}

export async function getCoursesHandler(): Promise<CourseListResponse> {
  return listCourses();
}

export async function getCourseHandler(
  request: FastifyRequest<{ Params: GetCourseParams }>
): Promise<CourseResource> {
  return getCourseById(request.params.id);
}
