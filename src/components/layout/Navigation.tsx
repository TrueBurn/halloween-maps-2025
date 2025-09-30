'use client';

import Link from 'next/link';
import { MapPin, List, RefreshCw, Info } from 'lucide-react';
import { env } from '~/env';

export function Navigation() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <nav className="sticky top-0 z-50 h-[60px] bg-white shadow-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        {/* Left: Neighborhood Name */}
        <Link
          href="/"
          className="text-xl font-bold text-primary hover:text-primary/80 transition-colors"
        >
          {env.NEXT_PUBLIC_NEIGHBORHOOD_NAME}
        </Link>

        {/* Right: Icon Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex h-12 w-12 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-primary transition-colors"
            title="Map View"
          >
            <MapPin className="h-5 w-5" />
          </Link>

          <Link
            href="/locations"
            className="flex h-12 w-12 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-primary transition-colors"
            title="List View"
          >
            <List className="h-5 w-5" />
          </Link>

          <button
            onClick={handleRefresh}
            className="flex h-12 w-12 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-primary transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </button>

          <button
            className="flex h-12 w-12 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-primary transition-colors"
            title="Information"
          >
            <Info className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
