'use client';

import Link from 'next/link';
import { MapPin, List, RefreshCw, Info, X } from 'lucide-react';
import { env } from '~/env';
import { useState } from 'react';
import { createPortal } from 'react-dom';

export function Navigation() {
  const [showInfo, setShowInfo] = useState(false);

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
            onClick={() => setShowInfo(true)}
            className="flex h-12 w-12 items-center justify-center rounded-lg text-text-secondary hover:bg-gray-800 hover:text-primary transition-colors"
            title="Information"
          >
            <Info className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Info Modal - Rendered via Portal */}
      {showInfo && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-surface border-2 border-gray-700 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-gray-700 p-4">
              <h2 className="text-xl font-bold text-orange-500">
                🎃 Halloween Maps
              </h2>
              <button
                onClick={() => setShowInfo(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-gray-800 hover:text-error transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 text-text-secondary">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  📅 Event Details
                </h3>
                <p>
                  <strong>Date:</strong> {env.NEXT_PUBLIC_EVENT_DATE}
                </p>
                <p>
                  <strong>Start Time:</strong> {env.NEXT_PUBLIC_EVENT_START_TIME}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  📍 How to Use
                </h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>View the map to see participating locations</li>
                  <li>Use the list view to filter by route and type</li>
                  <li>Green markers have candy available</li>
                  <li>Red markers are out of candy</li>
                  <li>Purple markers have activities</li>
                  <li>Tap any marker for more details</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  🗺️ Routes
                </h3>
                <ul className="space-y-1 list-disc list-inside">
                  <li><strong>Over 8:</strong> Full route for older kids</li>
                  <li><strong>Under 8:</strong> Shorter route for younger kids</li>
                  <li><strong>Toddlers:</strong> Brief route for little ones</li>
                </ul>
              </div>

              <p className="text-sm text-center border-t-2 border-gray-700 pt-4">
                Happy Halloween! 👻🍬
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </nav>
  );
}
