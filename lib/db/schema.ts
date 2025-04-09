// lib/db/schema.ts
import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

export type SelectBook = typeof books.$inferSelect;
export type Book = typeof books.$inferInsert;
export type SelectAuthor = typeof authors.$inferSelect;
export type Author = typeof authors.$inferInsert;

export const authors = sqliteTable('authors', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  average_rating: text('average_rating'), // SQLite doesn't have decimal, using text
  text_reviews_count: integer('text_reviews_count'),
  ratings_count: integer('ratings_count'),
});

export const books = sqliteTable('books', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  isbn: text('isbn').unique(),
  isbn13: text('isbn13'),
  title: text('title').notNull(),
  publication_year: integer('publication_year'),
  publisher: text('publisher'),
  image_url: text('image_url'),
  description: text('description'),
  num_pages: integer('num_pages'),
  language_code: text('language_code'),
  text_reviews_count: integer('text_reviews_count'),
  ratings_count: integer('ratings_count'),
  average_rating: text('average_rating'), // Using text for decimal
  series: text('series'), // SQLite doesn't support arrays, we'll store as JSON string
  popular_shelves: text('popular_shelves'), // Store as JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  metadata: text('metadata'), // Store as JSON string
  title_tsv: text('title_tsv').notNull(),
  thumbhash: text('thumbhash'),
});

// Create indexes
sql`
  CREATE INDEX IF NOT EXISTS idx_books_title_tsv ON books(title_tsv);
  CREATE INDEX IF NOT EXISTS idx_books_publication_year ON books(publication_year);
  CREATE INDEX IF NOT EXISTS idx_books_average_rating ON books(average_rating);
  CREATE INDEX IF NOT EXISTS idx_books_language_code ON books(language_code);
  CREATE INDEX IF NOT EXISTS idx_books_num_pages ON books(num_pages);
  CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at);
  CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
  CREATE INDEX IF NOT EXISTS idx_books_id_title_image_url_thumbhash ON books(id, title, image_url, thumbhash);
`.execute;

export const bookToAuthor = sqliteTable(
  'book_to_author',
  {
    bookId: integer('book_id')
      .notNull()
      .references(() => books.id),
    authorId: text('author_id')
      .notNull()
      .references(() => authors.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.bookId, t.authorId] }),
  })
);

export const booksRelations = relations(books, ({ many }) => ({
  bookToAuthor: many(bookToAuthor),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  bookToAuthor: many(bookToAuthor),
}));

export const bookToAuthorRelations = relations(bookToAuthor, ({ one }) => ({
  book: one(books, {
    fields: [bookToAuthor.bookId],
    references: [books.id],
  }),
  author: one(authors, {
    fields: [bookToAuthor.authorId],
    references: [authors.id],
  }),
}));
