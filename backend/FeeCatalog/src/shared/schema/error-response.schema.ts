import { Type, Static } from '@sinclair/typebox';

/** JSON:API style error envelope shared by every domain's error responses. */
export const errorResponseSchema = Type.Object({
  errors: Type.Array(
    Type.Object({
      status: Type.String({ description: 'HTTP status code, as a string' }),
      code: Type.String({ description: 'Machine-readable domain error code' }),
      title: Type.String({ description: 'Short, human-readable error name' }),
      detail: Type.String({ description: 'Human-readable explanation specific to this error' })
    })
  )
});

export type ErrorResponse = Static<typeof errorResponseSchema>;
