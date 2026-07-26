import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'src/data/sql/models',
  migrations: {
    path: 'src/data/sql/migrations'
  },
  datasource: {
    url: env('DATABASE_URL')
  }
});
