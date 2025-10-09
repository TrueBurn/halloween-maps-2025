'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { LiveUsersCard } from './LiveUsersCard';
import { StatsGrid } from './StatsGrid';
import { PopularLocations } from './PopularLocations';

export function AnalyticsDashboard() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-8">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-surface border border-gray-800 rounded-t-lg px-6 py-4 flex items-center justify-between hover:bg-gray-900/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h2 className="text-lg font-bold text-text-primary">
              Live Analytics
            </h2>
          </div>
          <span className="text-sm text-text-secondary">
            Real-time visitor metrics
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-text-secondary" />
        ) : (
          <ChevronDown className="h-5 w-5 text-text-secondary" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="bg-surface border border-t-0 border-gray-800 rounded-b-lg p-6 space-y-6">
          {/* Live Users + Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <LiveUsersCard />
            <div className="lg:col-span-3">
              <StatsGrid />
            </div>
          </div>

          {/* Popular Locations */}
          <PopularLocations />
        </div>
      )}
    </div>
  );
}
