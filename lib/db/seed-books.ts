// lib/db/seed-books.ts
import path from 'path';
import { sql } from './drizzle';
import { processEntities } from './seed-utils';

const BATCH_SIZE = 900;
const CHECKPOINT_FILE = 'book_import_checkpoint.json';
const TOTAL_BOOKS = 10; // Update to match actual number of books in your file

interface BookData {
  isbn: string | null;
  isbn13: string | null;
  title: string;
  authors: { author_id: string; role: string }[];
  publication_year: string | null;
  publisher: string | null;
  image_url: string | null;
  description: string | null;
  num_pages: string | null;
  language_code: string | null;
  text_reviews_count: string | null;
  ratings_count: string | null;
  average_rating: string | null;
  series: string[] | null;
  popular_shelves: { count: string; name: string }[];
}

async function batchInsertBooks(batch: BookData[], db) {
  // Check if foreign keys are enabled
  sql.exec('PRAGMA foreign_keys = ON;');
  
  const insertBookStmt = db.prepare(`
    INSERT OR IGNORE INTO books 
    (isbn, isbn13, title, publication_year, publisher, image_url, description, num_pages, 
     language_code, text_reviews_count, ratings_count, average_rating, series, popular_shelves, title_tsv)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const getBookIdStmt = db.prepare(`
    SELECT id FROM books WHERE isbn = ?
  `);

  const checkAuthorStmt = db.prepare(`
    SELECT 1 FROM authors WHERE id = ?
  `);

  const insertAuthorRelationStmt = db.prepare(`
    INSERT OR IGNORE INTO book_to_author (book_id, author_id)
    VALUES (?, ?)
  `);

  try {
    db.transaction(() => {
      for (const book of batch) {
        // Skip books without required fields
        if (!book.title) {
          console.log('Skipping book with missing title');
          continue;
        }

        // Insert book
        insertBookStmt.run(
          book.isbn || null,
          book.isbn13 || null,
          book.title,
          book.publication_year ? parseInt(book.publication_year) : null,
          book.publisher || null,
          book.image_url || null,
          book.description || null,
          book.num_pages ? parseInt(book.num_pages) : null,
          book.language_code || null,
          book.text_reviews_count ? parseInt(book.text_reviews_count) : null,
          book.ratings_count ? parseInt(book.ratings_count) : null,
          book.average_rating || null,
          book.series ? JSON.stringify(book.series) : null,
          JSON.stringify(book.popular_shelves || []),
          book.title // Use title as title_tsv for simple search
        );

        // Get the book ID
        if (book.isbn) {
          const bookRow = getBookIdStmt.get(book.isbn);
          if (bookRow && book.authors && book.authors.length > 0) {
            // Insert author relations, but check if author exists first
            for (const author of book.authors) {
              if (!author.author_id) {
                console.log(`Skipping author relation for book "${book.title}" - missing author_id`);
                continue;
              }
              
              // Check if author exists before creating relationship
              const authorExists = checkAuthorStmt.get(author.author_id);
              if (authorExists) {
                insertAuthorRelationStmt.run(bookRow.id, author.author_id);
              } else {
                console.log(`Author with ID ${author.author_id} not found for book "${book.title}"`);
              }
            }
          }
        }
      }
    })();
    return batch.length;
  } catch (error) {
    console.error('Error in transaction:', error);
    return 0;
  }
}

async function main() {
  try {
    const bookCount = await processEntities(
      path.resolve('./lib/db/books.json'),
      CHECKPOINT_FILE,
      BATCH_SIZE,
      batchInsertBooks,
      sql,
      TOTAL_BOOKS
    );
    console.log(
      `Seeded ${bookCount.toLocaleString()} / ${TOTAL_BOOKS.toLocaleString()} books`
    );
  } catch (error) {
    console.error('Error seeding books:', error);
  }
}

main().catch(console.error);
