import { Type, Static } from '@sinclair/typebox';

export const healthResponseSchema = Type.Object({
  status: Type.String(),
  service: Type.String(),
  timestamp: Type.String()
});

export type HealthResponse = Static<typeof healthResponseSchema>;

export const HealthResponseSchema = {
  description: 'Returns the health status of the Fee Catalog service',
  tags: ['health'],
  response: {
    200: healthResponseSchema
  }
};
