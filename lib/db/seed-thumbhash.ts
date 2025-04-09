import path from 'path';
import { sql } from './drizzle';
import { processEntities } from './seed-utils';
import sharp from 'sharp';
import * as ThumbHash from 'thumbhash';
import { EMPTY_IMAGE_URL } from './queries';
import pLimit from 'p-limit';

const BATCH_SIZE = 900;
const CHECKPOINT_FILE = 'thumbhash_update_checkpoint.json';
const TOTAL_BOOKS = 10; // Set to match your actual book count
const CONCURRENCY_LIMIT = 10;

interface BookData {
  image_url: string | null;
  title?: string;
  isbn?: string;
}

const limit = pLimit(CONCURRENCY_LIMIT);

async function fetchImage(url: string): Promise<Buffer | null> {
  try {
    // Skip URLs that aren't actual image files or are product pages
    if (url.includes('amazon.co.uk/') && !url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      console.error(`Skipping non-image URL: ${url}`);
      return null;
    }

    // Define headers based on the domain
    let headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    };
    
    // Add domain-specific headers
    if (url.includes('goodreads.com')) {
      headers['Referer'] = 'https://www.goodreads.com/';
    } else if (url.includes('amazon.com') || url.includes('amazon.co.uk') || 
               url.includes('images-na.ssl-images-amazon.com')) {
      headers['Referer'] = 'https://www.amazon.com/';
      headers['Origin'] = 'https://www.amazon.com';
      headers['Accept'] = 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8';
    } else if (url.includes('m.media-amazon.com')) {
      headers['Referer'] = 'https://www.amazon.com/';
      headers['Origin'] = 'https://www.amazon.com';
      headers['Accept'] = 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8';
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      console.error(`Failed to fetch image: ${url} - Status: ${response.status}`);
      return null;
    }
    
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error(`Error fetching image: ${url}`, error);
    return null;
  }
}

async function generateThumbHash(imageBuffer: Buffer): Promise<string | null> {
  try {
    // Process the image with more robust error handling
    let processedImage;
    try {
      processedImage = await sharp(imageBuffer)
        .resize(100, 100, { fit: 'inside' })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    } catch (sharpError) {
      console.error('Sharp processing error:', sharpError);
      return null;
    }

    const { data, info } = processedImage;
    
    // Validate dimensions
    if (info.width === 0 || info.height === 0) {
      console.error('Invalid image dimensions');
      return null;
    }

    const binaryThumbHash = ThumbHash.rgbaToThumbHash(
      info.width,
      info.height,
      data
    );
    return Buffer.from(binaryThumbHash).toString('base64');
  } catch (error) {
    console.error('Error generating thumbhash:', error);
    return null;
  }
}

async function processBook(book: BookData): Promise<[string, string, string | undefined] | null> {
  if (!book.image_url || book.image_url === EMPTY_IMAGE_URL) {
    return null;
  }
  
  try {
    const imageBuffer = await fetchImage(book.image_url);
    if (!imageBuffer) {
      console.log(`Could not fetch image for ${book.title || 'unknown book'} (ISBN: ${book.isbn}): ${book.image_url}`);
      return null;
    }
    
    const thumbHash = await generateThumbHash(imageBuffer);
    if (thumbHash) {
      return [thumbHash, book.image_url, book.isbn];
    }
    
    console.log(`Could not generate thumbhash for ${book.title || 'unknown book'} (ISBN: ${book.isbn}): ${book.image_url}`);
  } catch (error) {
    console.error(`Error processing book image: ${book.image_url}`, error);
  }
  
  return null;
}

async function batchUpdateThumbHash(batch: BookData[], database) {
  // Process only unique image URLs to avoid duplicates
  const uniqueBooks = batch.filter((book, index, self) => 
    book.image_url && self.findIndex(b => b.image_url === book.image_url) === index
  );
  
  console.log(`Processing ${uniqueBooks.length} unique books out of ${batch.length} total`);
  
  const processedBooks = await Promise.all(
    uniqueBooks.map((book) => limit(() => processBook(book)))
  );

  const validResults = processedBooks.filter((result): result is [string, string, string | undefined] => result !== null);
  
  if (validResults.length > 0) {
    try {
      // Use the raw sql connection for direct query execution
      sql.exec('BEGIN TRANSACTION');
      
      for (const [thumbHash, imageUrl, isbn] of validResults) {
        // Try to update by ISBN first if available
        if (isbn) {
          sql.exec(`
            UPDATE books
            SET thumbhash = '${thumbHash}'
            WHERE isbn = '${isbn}'
          `);
        } else {
          // Fall back to updating by image_url
          sql.exec(`
            UPDATE books
            SET thumbhash = '${thumbHash}'
            WHERE image_url = '${imageUrl}'
          `);
        }
      }
      
      sql.exec('COMMIT');
      console.log(`Successfully updated ${validResults.length} books with thumbhash values`);
    } catch (error) {
      console.error('Error in transaction:', error);
      sql.exec('ROLLBACK');
      throw error;
    }
  }
  
  return validResults.length;
}

async function main() {
  try {
    // Enable foreign key support
    sql.exec('PRAGMA foreign_keys = ON;');
    
    const bookCount = await processEntities(
      path.resolve('./lib/db/books.json'),
      CHECKPOINT_FILE,
      BATCH_SIZE,
      batchUpdateThumbHash,
      sql,
      TOTAL_BOOKS
    );
    console.log(
      `Updated thumbhash for ${bookCount.toLocaleString()} / ${TOTAL_BOOKS.toLocaleString()} books`
    );
  } catch (error) {
    console.error('Error updating thumbhash:', error);
  }
}

main().catch(console.error);
