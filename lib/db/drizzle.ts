// lib/db/drizzle.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';
import * as schema from './schema';

// Create a SQLite database connection
const sqlite = new Database(path.join(process.cwd(), 'data.db'));

// Export the database connection with schema
export const db = drizzle(sqlite, { schema });
// Export the raw SQLite connection for direct queries
export const sql = sqlite;
