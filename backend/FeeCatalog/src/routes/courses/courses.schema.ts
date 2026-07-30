import { Type, Static } from '@sinclair/typebox';
import { errorResponseSchema } from '../../shared/schema/error-response.schema';

export const createCourseBodySchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  durationYears: Type.Number({ exclusiveMinimum: 0, description: 'Program duration in years.' })
});

export type CreateCourseBody = Static<typeof createCourseBodySchema>;

const courseAttributesSchema = Type.Object({
  name: Type.String(),
  durationYears: Type.Number()
});

export const courseResourceSchema = Type.Object({
  data: Type.Object({
    type: Type.Literal('courses'),
    id: Type.String(),
    attributes: courseAttributesSchema
  })
});

export type CourseResource = Static<typeof courseResourceSchema>;

export const courseListResponseSchema = Type.Object({
  data: Type.Array(
    Type.Object({
      type: Type.Literal('courses'),
      id: Type.String(),
      attributes: courseAttributesSchema
    })
  )
});

export type CourseListResponse = Static<typeof courseListResponseSchema>;

export const CreateCourseSchema = {
  description: 'Creates a new course (academic program).',
  tags: ['courses'],
  body: createCourseBodySchema,
  response: {
    201: courseResourceSchema,
    400: errorResponseSchema
  }
};

export const ListCoursesSchema = {
  description: 'Returns every course, ordered by name.',
  tags: ['courses'],
  response: {
    200: courseListResponseSchema
  }
};

export const getCourseParamsSchema = Type.Object({
  id: Type.String({ pattern: '^[1-9][0-9]*$', description: 'Course id' })
});

export type GetCourseParams = Static<typeof getCourseParamsSchema>;

export const GetCourseSchema = {
  description: 'Returns a single course by id.',
  tags: ['courses'],
  params: getCourseParamsSchema,
  response: {
    200: courseResourceSchema,
    400: errorResponseSchema,
    404: errorResponseSchema
  }
};
