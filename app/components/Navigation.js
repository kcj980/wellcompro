'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-blue-800 text-white sticky top-0 z-50 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center -ml-2">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-white">
                Wellcom
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <Link
                href="/estimate"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out
                  ${isActive('/estimate')
                    ? 'bg-blue-700 text-white shadow-lg'
                    : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                  }`}
              >
                견적
              </Link>
              <Link
                href="/search"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out
                  ${isActive('/search')
                    ? 'bg-blue-700 text-white shadow-lg'
                    : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                  }`}
              >
                검색
              </Link>
              <Link
                href="/panel"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out
                  ${isActive('/panel')
                    ? 'bg-blue-700 text-white shadow-lg'
                    : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                  }`}
              >
                패널
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}