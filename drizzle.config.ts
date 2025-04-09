// Update drizzle.config.ts
//import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  driver: 'better-sqlite', // Change from 'dialect: postgresql'
  dbCredentials: {
    url: './data.db', // Change from PostgreSQL URL
  },
} satisfies Config;
