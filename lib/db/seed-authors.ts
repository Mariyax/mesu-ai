// lib/db/seed-authors.ts
import path from 'path';
import { sql } from './drizzle';
import { processEntities } from './seed-utils';

const BATCH_SIZE = 2000;
const CHECKPOINT_FILE = 'author_import_checkpoint.json';
const TOTAL_AUTHORS = 4; // 4 in sample data

interface AuthorData {
  average_rating: string;
  author_id: string;
  text_reviews_count: string;
  name: string;
  ratings_count: string;
}

async function batchInsertAuthors(batch: AuthorData[], db) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO authors (id, name, average_rating, text_reviews_count, ratings_count)
    VALUES (?, ?, ?, ?, ?)
  `);

  db.transaction(() => {
    for (const author of batch) {
      stmt.run(
        author.author_id,
        author.name,
        author.average_rating,
        parseInt(author.text_reviews_count),
        parseInt(author.ratings_count)
      );
    }
  })();
}

async function main() {
  try {
    const authorCount = await processEntities(
      path.resolve('./lib/db/authors.json'),
      CHECKPOINT_FILE,
      BATCH_SIZE,
      batchInsertAuthors,
      sql,
      TOTAL_AUTHORS
    );
    console.log(
      `Seeded ${authorCount.toLocaleString()} / ${TOTAL_AUTHORS.toLocaleString()} authors`
    );
  } catch (error) {
    console.error('Error seeding authors:', error);
  }
}

main().catch(console.error);
