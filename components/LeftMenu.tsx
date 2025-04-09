// components/LeftMenu.tsx
import Link from 'next/link';

export function LeftMenu() {
  return (
    <div className="w-[200px] h-screen bg-white dark:bg-gray-800 p-4 shadow-sm">
      <nav>
        <ul className="space-y-2">
          <li><Link href="/" className="block hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded">Home</Link></li>
          <li><Link href="/authors" className="block hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded">Authors</Link></li>
          <li><Link href="https://mariyax.github.io/Flipping-Book/" target="_blank" className="block hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded">Flipping Book</Link></li>
        </ul>
      </nav>
    </div>
  );
}
