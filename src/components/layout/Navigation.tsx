'use client';

import Link from 'next/link';
import { MapPin, List, RefreshCw, Info, X } from 'lucide-react';
import { env } from '~/env';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const INFO_MODAL_STORAGE_KEY = 'halloween-maps-info-modal-seen';

export function Navigation() {
  const [showInfo, setShowInfo] = useState(false);

  // Auto-open modal on first visit
  useEffect(() => {
    const hasSeenModal = localStorage.getItem(INFO_MODAL_STORAGE_KEY);
    if (!hasSeenModal) {
      setShowInfo(true);
    }
  }, []);

  // Close modal and mark as seen
  const handleCloseModal = () => {
    localStorage.setItem(INFO_MODAL_STORAGE_KEY, 'true');
    setShowInfo(false);
  };

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
          onClick={handleCloseModal}
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
                onClick={handleCloseModal}
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
                <div className="space-y-3">
                  {/* Houses */}
                  <div>
                    <p className="text-xs font-semibold text-text-secondary mb-1.5">Houses:</p>
                    <div className="space-y-1.5 ml-2">
                      <div className="flex items-center gap-3">
                        <img src="/icons/house.svg" alt="House with candy" className="w-7 h-7" />
                        <span className="text-sm"><strong>Orange:</strong> Has candy</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <img src="/icons/house-start.svg" alt="House starting point" className="w-8 h-8" />
                        <span className="text-sm"><strong>Green:</strong> Starting point</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <img src="/icons/house-activity.svg" alt="House with activity" className="w-7 h-7" />
                        <span className="text-sm"><strong>Pink:</strong> Has activity</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <img src="/icons/house-no-candy.svg" alt="House no candy" className="w-7 h-7" />
                        <span className="text-sm"><strong>Purple:</strong> No candy</span>
                      </div>
                    </div>
                  </div>

                  {/* Tables */}
                  <div>
                    <p className="text-xs font-semibold text-text-secondary mb-1.5">Tables:</p>
                    <div className="space-y-1.5 ml-2">
                      <div className="flex items-center gap-3">
                        <img src="/icons/table.svg" alt="Table with candy" className="w-7 h-7" />
                        <span className="text-sm"><strong>Orange:</strong> Has candy</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <img src="/icons/table-start.svg" alt="Table starting point" className="w-8 h-8" />
                        <span className="text-sm"><strong>Green:</strong> Starting point</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <img src="/icons/table-activity.svg" alt="Table with activity" className="w-7 h-7" />
                        <span className="text-sm"><strong>Pink:</strong> Has activity</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <img src="/icons/table-no-candy.svg" alt="Table no candy" className="w-7 h-7" />
                        <span className="text-sm"><strong>Purple:</strong> No candy</span>
                      </div>
                    </div>
                  </div>

                  {/* Cars */}
                  <div>
                    <p className="text-xs font-semibold text-text-secondary mb-1.5">Cars (Trunk-or-Treat):</p>
                    <div className="space-y-1.5 ml-2">
                      <div className="flex items-center gap-3">
                        <img src="/icons/car.svg" alt="Car with candy" className="w-7 h-7" />
                        <span className="text-sm"><strong>Orange:</strong> Has candy</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <img src="/icons/car-start.svg" alt="Car starting point" className="w-8 h-8" />
                        <span className="text-sm"><strong>Green:</strong> Starting point</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <img src="/icons/car-activity.svg" alt="Car with activity" className="w-7 h-7" />
                        <span className="text-sm"><strong>Pink:</strong> Has activity</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <img src="/icons/car-no-candy.svg" alt="Car no candy" className="w-7 h-7" />
                        <span className="text-sm"><strong>Purple:</strong> No candy</span>
                      </div>
                    </div>
                  </div>

                  {/* Stores */}
                  <div>
                    <p className="text-xs font-semibold text-text-secondary mb-1.5">Stores:</p>
                    <div className="space-y-1.5 ml-2">
                      <div className="flex items-center gap-3">
                        <img src="/icons/store.svg" alt="Store with candy" className="w-7 h-7" />
                        <span className="text-sm"><strong>Orange:</strong> Has candy</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <img src="/icons/store-start.svg" alt="Store starting point" className="w-8 h-8" />
                        <span className="text-sm"><strong>Green:</strong> Starting point</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <img src="/icons/store-activity.svg" alt="Store with activity" className="w-7 h-7" />
                        <span className="text-sm"><strong>Pink:</strong> Has activity</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <img src="/icons/store-no-candy.svg" alt="Store no candy" className="w-7 h-7" />
                        <span className="text-sm"><strong>Purple:</strong> No candy</span>
                      </div>
                    </div>
                  </div>

                  {/* Static locations */}
                  <div>
                    <p className="text-xs font-semibold text-text-secondary mb-1.5">Other:</p>
                    <div className="space-y-1.5 ml-2">
                      <div className="flex items-center gap-3">
                        <img src="/icons/parking.svg" alt="Parking" className="w-7 h-7" />
                        <span className="text-sm"><strong>Parking:</strong> Designated parking area</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <img src="/icons/refreshments.svg" alt="Refreshments" className="w-7 h-7" />
                        <span className="text-sm"><strong>Refreshments:</strong> Drinks and snacks</span>
                      </div>
                    </div>
                  </div>

                  {/* Clusters */}
                  <div>
                    <p className="text-xs font-semibold text-text-secondary mb-1.5">Clusters:</p>
                    <div className="space-y-1.5 ml-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🦇</span>
                        <span className="text-sm"><strong>Orange (2):</strong> Nearby locations</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🕷️</span>
                        <span className="text-sm"><strong>Green (3):</strong> Nearby locations</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">👻</span>
                        <span className="text-sm"><strong>Purple (4+):</strong> Nearby locations</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {env.NEXT_PUBLIC_ROUTES.length > 1 && (
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    🗺️ Age Groups
                  </h3>
                  <p className="mb-2 text-sm">
                    Different age groups have different starting points (marked with green houses):
                  </p>
                  <ul className="space-y-1 list-disc list-inside">
                    {env.NEXT_PUBLIC_ROUTES.map((route) => (
                      <li key={route}>
                        <strong>{route}:</strong> Designated route for this age group
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm italic">
                    Use the list view to filter locations by your age group.
                  </p>
                </div>
              )}

              <p className="text-sm text-center border-t-2 border-gray-700 pt-4">
                Happy Halloween! 👻🍬
              </p>

              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="w-full py-3 mt-2 rounded-lg bg-primary text-white font-semibold hover:bg-indigo-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </nav>
  );
}
