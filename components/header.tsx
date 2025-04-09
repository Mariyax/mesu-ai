// components/Header.jsx
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-slate-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">Book Inventory</Link>
        <nav>
          <ul className="flex space-x-6">
            <li><Link href="/" className="hover:text-blue-300">Home</Link></li>
            <li><Link href="/authors" className="hover:text-blue-300">Authors</Link></li>
            <li><Link href="https://mariyax.github.io/Flipping-Book/" target="_blank" className="hover:text-blue-300">Flipping Book</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
