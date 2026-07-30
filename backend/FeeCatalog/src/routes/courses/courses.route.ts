import { FastifyInstance } from 'fastify';
import { CreateCourseSchema, GetCourseSchema, ListCoursesSchema } from './courses.schema';
import { getCourseHandler, getCoursesHandler, postCourseHandler } from './courses.handler';

export async function courseRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/', { schema: CreateCourseSchema }, postCourseHandler);

  fastify.get('/', { schema: ListCoursesSchema }, getCoursesHandler);

  fastify.get('/:id', { schema: GetCourseSchema }, getCourseHandler);
}
