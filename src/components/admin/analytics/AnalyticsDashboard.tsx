'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { DiagnosticsPanel } from './DiagnosticsPanel';
import { LiveUsersCard } from './LiveUsersCard';
import { LocationPermissionCard } from './LocationPermissionCard';
import { StatsGrid } from './StatsGrid';
import { PopularLocations } from './PopularLocations';
import { UserJourneyCard } from './UserJourneyCard';
import { LocationTypeCard } from './LocationTypeCard';
import { EngagementCard } from './EngagementCard';
import { FilterUsageCard } from './FilterUsageCard';
import { EventBreakdownCard } from './EventBreakdownCard';
import { RecentActivityFeed } from './RecentActivityFeed';
import { UserHeatmapPreviewCard } from './UserHeatmapPreviewCard';

export function AnalyticsDashboard() {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    // Keep refreshing state for 1 second for visual feedback
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-text-secondary">
            Real-time visitor metrics
          </span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 text-sm"
          title="Refresh analytics data"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Diagnostics Toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-2"
        >
          {showDiagnostics ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Hide Diagnostics
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show Diagnostics
            </>
          )}
        </button>
      </div>

      {/* Diagnostics Panel */}
      {showDiagnostics && <DiagnosticsPanel />}

      {/* Live Users + Location Permission + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <LiveUsersCard key={`live-${refreshKey}`} />
        <LocationPermissionCard key={`permission-${refreshKey}`} />
        <div className="lg:col-span-3">
          <StatsGrid key={`stats-${refreshKey}`} />
        </div>
      </div>

      {/* User Location Heatmap Preview */}
      <UserHeatmapPreviewCard key={`heatmap-${refreshKey}`} />

      {/* User Journey & Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <UserJourneyCard key={`journey-${refreshKey}`} />
        <LocationTypeCard key={`location-type-${refreshKey}`} />
        <EngagementCard key={`engagement-${refreshKey}`} />
      </div>

      {/* Popular Locations */}
      <PopularLocations key={`popular-${refreshKey}`} />

      {/* Filter Usage & Event Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FilterUsageCard key={`filters-${refreshKey}`} />
        <EventBreakdownCard key={`events-${refreshKey}`} />
      </div>

      {/* Recent Activity Feed */}
      <RecentActivityFeed key={`activity-${refreshKey}`} />
    </div>
  );
}
