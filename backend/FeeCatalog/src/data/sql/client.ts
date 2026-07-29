import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const dbClient = new PrismaClient({
  adapter,
  log: [{ emit: 'event', level: 'query' }],
});

dbClient.$on('query', (event) => {
  console.log(`${event.query} -- params: ${event.params}`);
});
