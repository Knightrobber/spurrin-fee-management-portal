import { buildApp } from '../../app';

describe('GET /health', () => {
  it('returns a static health payload', async () => {
    const app = await buildApp();

    const response = await app.inject({ method: 'GET', url: '/health' });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('fee-catalog');
    expect(typeof body.timestamp).toBe('string');

    await app.close();
  });
});
