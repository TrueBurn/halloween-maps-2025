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
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-2 sm:px-4 gap-2">
        {/* Left: Neighborhood Name */}
        <Link
          href="/"
          className="text-lg sm:text-xl md:text-2xl font-bold text-orange-500 hover:text-orange-400 transition-colors font-halloween tracking-wide truncate flex-shrink min-w-0"
          style={{
            fontFamily: 'var(--font-halloween)',
            textShadow: '0 0 20px rgba(239, 68, 68, 0.8), 0 0 30px rgba(239, 68, 68, 0.5), 0 4px 8px rgba(239, 68, 68, 0.4)'
          }}
        >
          {env.NEXT_PUBLIC_NEIGHBORHOOD_NAME}
        </Link>

        {/* Right: Icon Buttons */}
        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          <Link
            href="/"
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg text-text-secondary hover:bg-gray-800 hover:text-primary transition-colors"
            title="Map View"
          >
            <MapPin className="h-5 w-5" />
          </Link>

          <Link
            href="/locations"
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg text-text-secondary hover:bg-gray-800 hover:text-primary transition-colors"
            title="List View"
          >
            <List className="h-5 w-5" />
          </Link>

          <button
            onClick={handleRefresh}
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg text-text-secondary hover:bg-gray-800 hover:text-primary transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </button>

          <button
            onClick={() => setShowInfo(true)}
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg text-text-secondary hover:bg-gray-800 hover:text-primary transition-colors"
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
                  <li>View the interactive map to see all participating locations</li>
                  <li>Use the list view to filter by age group, type, and candy status</li>
                  <li>Click any marker on the map for details and walking directions</li>
                  <li>Track your location with the GPS button (bottom-right)</li>
                  <li>Refresh the page to see real-time updates from admins</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  🎨 Map Icon Key
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <img src="/icons/location.svg" alt="Regular location" className="w-8 h-8" />
                    <span><strong>Orange House:</strong> Participating with candy</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <img src="/icons/location-start.svg" alt="Starting point" className="w-9 h-9" />
                    <span><strong>Green House:</strong> Starting point for age group</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <img src="/icons/location-no-candy.svg" alt="No candy" className="w-8 h-8" />
                    <span><strong>Purple House:</strong> No candy (activity only)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <img src="/icons/location-activity.svg" alt="Activity" className="w-8 h-8" />
                    <span><strong>Pink House:</strong> Special activity available</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <img src="/icons/parking.svg" alt="Parking" className="w-8 h-8" />
                    <span><strong>Parking:</strong> Designated parking area</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <img src="/icons/refreshments.svg" alt="Refreshments" className="w-8 h-8" />
                    <span><strong>Refreshments:</strong> Drinks and snacks station</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <img src="/icons/car.svg" alt="Car" className="w-8 h-8" />
                    <span><strong>Car:</strong> Trunk-or-treat location</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🦇</span>
                    <span><strong>Orange Cluster (2):</strong> Nearby locations grouped</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🕷️</span>
                    <span><strong>Green Cluster (3):</strong> Nearby locations grouped</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👻</span>
                    <span><strong>Purple Cluster (4+):</strong> Nearby locations grouped</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  🗺️ Age Groups
                </h3>
                <p className="mb-2 text-sm">
                  Different age groups have different starting points (marked with green houses):
                </p>
                <ul className="space-y-1 list-disc list-inside">
                  <li><strong>Over 8:</strong> Full neighborhood route for older kids</li>
                  <li><strong>Under 8:</strong> Shorter route for younger children</li>
                  <li><strong>Toddlers:</strong> Brief route for little ones</li>
                </ul>
                <p className="mt-2 text-sm italic">
                  Use the list view to filter locations by your age group.
                </p>
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
