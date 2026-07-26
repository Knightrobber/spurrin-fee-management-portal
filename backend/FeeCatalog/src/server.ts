import 'dotenv/config';
import { buildApp } from './app';
import { dbClient } from './data/sql/client';

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function start(): Promise<void> {
  const app = await buildApp();

  try {
    await dbClient.$connect();
    await app.listen({ port: PORT, host: HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
