// lib/db/migrate.ts
import path from 'path';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './drizzle';

async function main() {
  await migrate(db, { migrationsFolder: path.join(__dirname, './migrations') });
  console.log(`Migrations complete`);
}

main();
