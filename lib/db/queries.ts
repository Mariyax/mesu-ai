// lib/db/queries.ts
// lib/db/queries.ts
import { sql, and, gte, eq, lte, not, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { books, authors, bookToAuthor } from './schema';
import { SearchParams } from '@/lib/url-state';


export const ITEMS_PER_PAGE = 28;
export const EMPTY_IMAGE_URL =
  'https://s.gr-assets.com/assets/nophoto/book/111x148-bcc042a9c91a29c1d680899eff700a03.png';

const yearFilter = (yr?: string) => {
  if (yr) {
    const maxYear = Math.max(1950, Math.min(2023, Number(yr)));
    return and(
      gte(books.publication_year, 1950),
      lte(books.publication_year, maxYear)
    );
  }

  return and(
    gte(books.publication_year, 1950),
    lte(books.publication_year, 2023)
  );
};

const ratingFilter = (rtg?: string) => {
  if (rtg) {
    const minRating = Number(rtg);
    return sql`CAST(${books.average_rating} AS REAL) >= ${minRating}`;
  }

  return undefined;
};

const languageFilter = (lng?: string) => {
  if (lng === 'en') {
    return sql`${books.language_code} IN ('eng', 'en-US', 'en-GB')`;
  }

  return lng ? eq(books.language_code, lng) : undefined;
};

const pageFilter = (pgs?: string) => {
  if (pgs) {
    const maxPages = Math.min(1000, Number(pgs));
    return lte(books.num_pages, maxPages);
  }

  return lte(books.num_pages, 1000);
};

const searchFilter = (q?: string) => {
  if (q) {
    // SQLite doesn't have full-text search like PostgreSQL
    // Use simple LIKE for each term
    const terms = q.trim().split(/\s+/);
    if (terms.length === 0) return undefined;
    
    // Create individual conditions for each term
    const conditions = terms.map(term => 
      sql`${books.title_tsv} LIKE ${'%' + term + '%'}`
    );
    
    // Combine with AND
    return sql.raw(conditions.map(c => `(${c})`).join(' AND '));
  }

  return undefined;
};

const imageFilter = () => {
  return and(
    not(isNull(books.image_url)),
    sql`${books.image_url} != ${EMPTY_IMAGE_URL}`
  );
};

const isbnFilter = (isbn?: string) => {
  if (isbn) {
    const isbnArray = isbn.split(',').map((id) => id.trim());
    if (isbnArray.length === 0) return undefined;
    
    // For SQLite, we need to handle this differently
    if (isbnArray.length === 1) {
      return eq(books.isbn, isbnArray[0]);
    }
    
    // For multiple ISBNs, use IN clause
    return sql`${books.isbn} IN (${sql.join(
      isbnArray.map(id => sql`${id}`),
      sql`, `
    )})`;
  }

  return undefined;
};

export async function fetchBooksWithPagination(searchParams: SearchParams) {
  let requestedPage = Math.max(1, Number(searchParams?.page) || 1);
  const filters = [
    yearFilter(searchParams.yr),
    ratingFilter(searchParams.rtg),
    languageFilter(searchParams.lng),
    pageFilter(searchParams.pgs),
    imageFilter(),
    searchFilter(searchParams.search),
    isbnFilter(searchParams.isbn),
  ].filter(Boolean);

  const whereClause = filters.length > 0 ? and(...filters) : undefined;
  const offset = (requestedPage - 1) * ITEMS_PER_PAGE;

  const paginatedBooks = await db
    .select({
      id: books.id,
      title: books.title,
      image_url: books.image_url,
      thumbhash: books.thumbhash,
    })
    .from(books)
    .where(whereClause)
    .orderBy(books.id)
    .limit(ITEMS_PER_PAGE)
    .offset(offset);

  return paginatedBooks;
}

export async function estimateTotalBooks(searchParams: SearchParams) {
  const filters = [
    yearFilter(searchParams.yr),
    ratingFilter(searchParams.rtg),
    languageFilter(searchParams.lng),
    pageFilter(searchParams.pgs),
    imageFilter(),
    searchFilter(searchParams.search),
    isbnFilter(searchParams.isbn),
  ].filter(Boolean);

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  // SQLite doesn't have EXPLAIN like PostgreSQL, so we'll count directly
  const countResult = await db
    .select({ count: sql`COUNT(*)` })
    .from(books)
    .where(whereClause);

  return countResult[0].count;
}

export async function fetchBookById(id: string) {
  // SQLite doesn't support array_agg, so we'll need to handle this differently
  const book = await db
    .select({
      id: books.id,
      isbn: books.isbn,
      title: books.title,
      publication_year: books.publication_year,
      publisher: books.publisher,
      image_url: books.image_url,
      description: books.description,
      num_pages: books.num_pages,
      language_code: books.language_code,
      text_reviews_count: books.text_reviews_count,
      ratings_count: books.ratings_count,
      average_rating: books.average_rating,
      series: books.series,
      createdAt: books.createdAt,
      thumbhash: books.thumbhash,
      popular_shelves: books.popular_shelves,
    })
    .from(books)
    .where(eq(books.id, parseInt(id)))
    .limit(1);

  if (!book[0]) return null;

  // Get authors in a separate query
  const bookAuthors = await db
    .select({
      name: authors.name,
    })
    .from(bookToAuthor)
    .leftJoin(authors, eq(bookToAuthor.authorId, authors.id))
    .where(eq(bookToAuthor.bookId, parseInt(id)));

  return {
    ...book[0],
    authors: bookAuthors.map(a => a.name),
    // Parse JSON strings back to objects
    series: book[0].series ? JSON.parse(book[0].series) : [],
    popular_shelves: book[0].popular_shelves ? JSON.parse(book[0].popular_shelves) : [],
  };
}
