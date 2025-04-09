import { db } from './drizzle';
import { sql } from './drizzle';


async function createTables() {
  sql.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      isbn TEXT UNIQUE,
      isbn13 TEXT,
      title TEXT NOT NULL,
      publication_year INTEGER,
      publisher TEXT,
      image_url TEXT,
      description TEXT,
      num_pages INTEGER,
      language_code TEXT,
      text_reviews_count INTEGER,
      ratings_count INTEGER,
      average_rating TEXT,
      series TEXT,
      popular_shelves TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      metadata TEXT,
      title_tsv TEXT NOT NULL,
      thumbhash TEXT
    );
    
    CREATE TABLE IF NOT EXISTS authors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      average_rating TEXT,
      text_reviews_count INTEGER,
      ratings_count INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS book_to_author (
      book_id INTEGER NOT NULL,
      author_id TEXT NOT NULL,
      PRIMARY KEY (book_id, author_id),
      FOREIGN KEY (book_id) REFERENCES books(id),
      FOREIGN KEY (author_id) REFERENCES authors(id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_books_title_tsv ON books(title_tsv);
    CREATE INDEX IF NOT EXISTS idx_books_publication_year ON books(publication_year);
    CREATE INDEX IF NOT EXISTS idx_books_average_rating ON books(average_rating);
    CREATE INDEX IF NOT EXISTS idx_books_language_code ON books(language_code);
    CREATE INDEX IF NOT EXISTS idx_books_num_pages ON books(num_pages);
    CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at);
    CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
    CREATE INDEX IF NOT EXISTS idx_books_id_title_image_url_thumbhash ON books(id, title, image_url, thumbhash);
  `);
  
  console.log('Tables created successfully');
}

createTables().catch(console.error);
