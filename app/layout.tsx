import './globals.css';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { Toaster } from 'sonner';
import { WelcomeToast } from '@/components/welcome-toast';
import { cn } from '@/lib/utils';
import { Filter, FilterFallback } from '@/components/filters';
import { Search, SearchFallback } from '@/components/search';
import { Suspense } from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Book Inventory — Next.js App Router',
  description: 'View 2 million books from Goodreads.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          'bg-gray-100 font-sans antialiased dark:bg-black dark:text-white',
          GeistSans.variable
        )}
      >
        {/* Header Bar */}
        <header className="bg-[#819CCD] text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center">
              {/* Use a raw GitHub URL or SVG icon instead */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-xl font-bold">Mesu AI - The Fan Fiction Portal</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              {/* Community Dropdown */}
              <div className="relative group">
                <button className="flex items-center hover:text-blue-200">
                  Community
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded shadow-lg py-2 z-50 hidden group-hover:block">
                  <Link href="/" className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Forums</Link>
                  <Link href="/" className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Groups</Link>
                  <Link href="/" className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Events</Link>
                </div>
              </div>
              
              {/* Browse Link with visual arrow */}
              <Link href="/" className="flex items-center hover:text-blue-200">
                Browse
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              
              {/* Write Dropdown */}
              <div className="relative group">
                <button className="flex items-center hover:text-blue-200">
                  Write
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded shadow-lg py-2 z-50 hidden group-hover:block">
                  <Link href="/" className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Create a new story</Link>
                  <Link href="/" className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">My Stories</Link>
                  <Link href="/" className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Helpful writer resources</Link>
                  <Link href="/" className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Programs & opportunities</Link>
                  <Link href="/" className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Writing contests</Link>
                </div>
              </div>
              
              {/* Premium Button */}
              <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Try Premium
              </button>
              
              {/* User Icon */}
              <div className="relative group">
                <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden cursor-pointer flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded shadow-lg py-2 z-50 hidden group-hover:block">
                  <Link href="/" className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Profile</Link>
                  <Link href="/" className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Settings</Link>
                  <Link href="/" className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Logout</Link>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <div className="group flex w-full">
          <div className="hidden md:block w-[300px] h-screen sticky top-0 p-8">
            <div className="h-full rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
              <div className="h-full overflow-y-auto p-4">
                <Suspense fallback={<FilterFallback />}>
                  <Filter />
                </Suspense>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col min-h-screen">
            <div className="sticky top-0 z-10 bg-gray-100 dark:bg-black">
              <div className="mx-8 py-4">
                <Suspense fallback={<SearchFallback />}>
                  <Search />
                </Suspense>
              </div>
            </div>
            <div className="flex-1 flex flex-col p-4">{children}</div>
          </div>
        </div>
        <Toaster closeButton />
        <WelcomeToast />
      </body>
    </html>
  );
}
