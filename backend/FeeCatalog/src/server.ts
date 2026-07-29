import 'dotenv/config';
import { buildApp } from './app';
import { dbClient } from './data/sql/client';

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function start(): Promise<void> {
  const app = await buildApp();

  const shutdown = (signal: string) => {
    app.log.info(`${signal} signal received: closing server`);

    app.close().then(
      async () => {
        await dbClient.$disconnect();
        app.log.info(`Server closed after ${signal}`);
        process.exit(0);
      },
      (err) => {
        app.log.error(err, `Error closing server after ${signal}`);
        process.exit(1);
      },
    );
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  try {
    await dbClient.$connect();
    await app.listen({ port: PORT, host: HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
