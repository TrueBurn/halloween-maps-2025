'use client';

import Link from 'next/link';
import { MapPin, List, RefreshCw, Info } from 'lucide-react';
import { env } from '~/env';

export function Navigation() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <nav className="sticky top-0 z-50 h-[60px] bg-surface shadow-[0_4px_6px_-1px_rgba(0,0,0,0.5)] border-b-2 border-gray-700">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        {/* Left: Neighborhood Name */}
        <Link
          href="/"
          className="text-2xl font-bold text-orange-500 hover:text-orange-400 transition-colors font-halloween tracking-wide"
          style={{
            fontFamily: 'var(--font-halloween)',
            textShadow: '0 0 20px rgba(239, 68, 68, 0.8), 0 0 30px rgba(239, 68, 68, 0.5), 0 4px 8px rgba(239, 68, 68, 0.4)'
          }}
        >
          {env.NEXT_PUBLIC_NEIGHBORHOOD_NAME}
        </Link>

        {/* Right: Icon Buttons */}
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="flex h-12 w-12 items-center justify-center rounded-lg text-text-secondary hover:bg-gray-800 hover:text-primary transition-colors"
            title="Map View"
          >
            <MapPin className="h-5 w-5" />
          </Link>

          <Link
            href="/locations"
            className="flex h-12 w-12 items-center justify-center rounded-lg text-text-secondary hover:bg-gray-800 hover:text-primary transition-colors"
            title="List View"
          >
            <List className="h-5 w-5" />
          </Link>

          <button
            onClick={handleRefresh}
            className="flex h-12 w-12 items-center justify-center rounded-lg text-text-secondary hover:bg-gray-800 hover:text-primary transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </button>

          <button
            className="flex h-12 w-12 items-center justify-center rounded-lg text-text-secondary hover:bg-gray-800 hover:text-primary transition-colors"
            title="Information"
          >
            <Info className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
