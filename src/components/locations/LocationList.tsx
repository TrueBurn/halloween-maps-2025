'use client';

import { useState, useMemo } from 'react';
import { Loader2, Filter } from 'lucide-react';
import { useLocations } from '~/lib/hooks/useLocations';
import { useUserLocation } from '~/lib/hooks/useUserLocation';
import { usePostHog } from '~/providers/PostHogProvider';
import { LocationCard } from './LocationCard';
import { calculateDistance } from '~/lib/utils/distance';
import type { Tables } from '~/types/database.types';
import { env } from '~/env';

type Location = Tables<'locations'>;
type LocationType = Location['location_type'];
type Route = Location['route'];
type SortOption = 'distance' | 'address' | 'none';

export function LocationList() {
  const { locations, loading, error } = useLocations();
  const { location: userLocation } = useUserLocation();
  const posthog = usePostHog();
  const [filterType, setFilterType] = useState<LocationType | 'All'>('All');
  const [filterRoute, setFilterRoute] = useState<string>('All');
  const [filterCandy, setFilterCandy] = useState<'All' | 'Has' | 'None'>('All');
  const [showStartingPointsOnly, setShowStartingPointsOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('none');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort locations
  const filteredAndSortedLocations = useMemo(() => {
    // First, filter
    let result = locations.filter((location) => {
      if (showStartingPointsOnly && !location.is_start) return false;
      if (filterType !== 'All' && location.location_type !== filterType) return false;
      if (filterRoute !== 'All' && filterRoute !== 'None' && location.route !== filterRoute) return false;
      if (filterRoute === 'None' && location.route !== null) return false;
      if (filterCandy === 'Has' && !location.has_candy) return false;
      if (filterCandy === 'None' && location.has_candy) return false;
      return true;
    });

    // Then, sort
    if (sortBy === 'distance' && userLocation) {
      result = [...result].sort((a, b) => {
        const distA = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.latitude,
          a.longitude
        );
        const distB = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.latitude,
          b.longitude
        );
        return distA - distB;
      });
    } else if (sortBy === 'address') {
      result = [...result].sort((a, b) => a.address.localeCompare(b.address));
    }

    return result;
  }, [locations, filterType, filterRoute, filterCandy, showStartingPointsOnly, sortBy, userLocation]);

  // Count active filters
  const activeFiltersCount =
    (filterType !== 'All' ? 1 : 0) +
    (filterRoute !== 'All' ? 1 : 0) +
    (filterCandy !== 'All' ? 1 : 0) +
    (showStartingPointsOnly ? 1 : 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-text-secondary">Loading locations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-error font-medium">Error loading locations</p>
          <p className="text-sm text-text-secondary mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-text-primary font-medium">No locations yet</p>
          <p className="text-sm text-text-secondary mt-1">
            Add some locations to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Filter & Sort Bar */}
      <div className="bg-surface border-b border-gray-800 sticky top-[60px] z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium text-text-primary hover:text-primary transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown - Always Visible */}
            <select
              value={sortBy}
              onChange={(e) => {
                const newSort = e.target.value as SortOption;
                setSortBy(newSort);
                posthog?.capture('location_sorted', { sort_by: newSort });
              }}
              className="px-3 py-1.5 text-sm bg-gray-900 text-text-primary border border-gray-800 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="none">Default</option>
              <option value="distance" disabled={!userLocation}>
                {userLocation ? 'Nearest' : 'Nearest (GPS needed)'}
              </option>
              <option value="address">A-Z</option>
            </select>
          </div>

          {showFilters && (
            <div className="mt-3 space-y-3">
              {/* Starting Points Toggle */}
              <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg">
                <label className="text-sm font-medium text-text-primary">
                  Show Only Starting Points
                </label>
                <button
                  onClick={() => {
                    const newValue = !showStartingPointsOnly;
                    setShowStartingPointsOnly(newValue);
                    posthog?.capture('location_filter_applied', {
                      filter_type: 'starting_points_only',
                      filter_value: newValue,
                    });
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showStartingPointsOnly ? 'bg-primary' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showStartingPointsOnly ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">
                  Location Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => {
                    const newType = e.target.value as LocationType | 'All';
                    setFilterType(newType);
                    posthog?.capture('location_filter_applied', {
                      filter_type: 'location_type',
                      filter_value: newType,
                    });
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-900 text-text-primary border border-gray-800 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="All">All Types</option>
                  <option value="House">House</option>
                  <option value="Refreshments">Refreshments</option>
                  <option value="Car">Car</option>
                  <option value="Parking">Parking</option>
                  <option value="Table">Table</option>
                </select>
              </div>

              {/* Route Filter */}
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">
                  Age Group (Starting Points)
                </label>
                <select
                  value={filterRoute}
                  onChange={(e) => {
                    const newRoute = e.target.value;
                    setFilterRoute(newRoute);
                    posthog?.capture('location_filter_applied', {
                      filter_type: 'age_group',
                      filter_value: newRoute,
                    });
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-900 text-text-primary border border-gray-800 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="All">All Age Groups</option>
                  {env.NEXT_PUBLIC_ROUTES.map((route) => (
                    <option key={route} value={route}>
                      {route}
                    </option>
                  ))}
                  <option value="None">No Age Group</option>
                </select>
              </div>

              {/* Candy Filter */}
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">
                  Candy Available
                </label>
                <select
                  value={filterCandy}
                  onChange={(e) => {
                    const newCandy = e.target.value as 'All' | 'Has' | 'None';
                    setFilterCandy(newCandy);
                    posthog?.capture('location_filter_applied', {
                      filter_type: 'candy_status',
                      filter_value: newCandy,
                    });
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-900 text-text-primary border border-gray-800 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="All">All</option>
                  <option value="Has">Has Candy</option>
                  <option value="None">No Candy</option>
                </select>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => {
                    setFilterType('All');
                    setFilterRoute('All');
                    setFilterCandy('All');
                    setShowStartingPointsOnly(false);
                    posthog?.capture('location_filters_cleared', {
                      filters_cleared: activeFiltersCount,
                    });
                  }}
                  className="w-full px-3 py-2 text-sm text-primary hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="px-4 py-3 bg-background">
        <p className="text-sm text-text-secondary">
          Showing {filteredAndSortedLocations.length} of {locations.length} locations
        </p>
      </div>

      {/* Location Cards */}
      {filteredAndSortedLocations.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-text-primary font-medium">No locations match your filters</p>
            <p className="text-sm text-text-secondary mt-1">
              Try adjusting your filter settings
            </p>
          </div>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {filteredAndSortedLocations.map((location) => (
            <LocationCard key={location.id} location={location} userLocation={userLocation} />
          ))}
        </div>
      )}
    </div>
  );
}
