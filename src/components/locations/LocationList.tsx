'use client';

import { useState, useMemo } from 'react';
import { Loader2, Filter } from 'lucide-react';
import { useLocations } from '~/lib/hooks/useLocations';
import { useUserLocation } from '~/lib/hooks/useUserLocation';
import { LocationCard } from './LocationCard';
import { calculateDistance } from '~/lib/utils/distance';
import type { Tables } from '~/types/database.types';

type Location = Tables<'locations'>;
type LocationType = Location['location_type'];
type Route = Location['route'];
type SortOption = 'distance' | 'address' | 'none';

export function LocationList() {
  const { locations, loading, error } = useLocations();
  const { location: userLocation } = useUserLocation();
  const [filterType, setFilterType] = useState<LocationType | 'All'>('All');
  const [filterRoute, setFilterRoute] = useState<string>('All');
  const [filterCandy, setFilterCandy] = useState<'All' | 'Has' | 'None'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('none');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort locations
  const filteredAndSortedLocations = useMemo(() => {
    // First, filter
    let result = locations.filter((location) => {
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
  }, [locations, filterType, filterRoute, filterCandy, sortBy, userLocation]);

  // Count active filters
  const activeFiltersCount =
    (filterType !== 'All' ? 1 : 0) +
    (filterRoute !== 'All' ? 1 : 0) +
    (filterCandy !== 'All' ? 1 : 0);

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
          <p className="text-sm text-gray-600 mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-900 font-medium">No locations yet</p>
          <p className="text-sm text-gray-600 mt-1">
            Add some locations to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Filter & Sort Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-[60px] z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
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
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
              {/* Type Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Location Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as LocationType | 'All')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Route
                </label>
                <select
                  value={filterRoute}
                  onChange={(e) => setFilterRoute(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="All">All Routes</option>
                  <option value="Over 8">Over 8</option>
                  <option value="Under 8">Under 8</option>
                  <option value="Toddlers">Toddlers</option>
                  <option value="None">No Route</option>
                </select>
              </div>

              {/* Candy Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Candy Available
                </label>
                <select
                  value={filterCandy}
                  onChange={(e) => setFilterCandy(e.target.value as 'All' | 'Has' | 'None')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
                  }}
                  className="w-full px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="px-4 py-3 bg-gray-50">
        <p className="text-sm text-gray-600">
          Showing {filteredAndSortedLocations.length} of {locations.length} locations
        </p>
      </div>

      {/* Location Cards */}
      {filteredAndSortedLocations.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-900 font-medium">No locations match your filters</p>
            <p className="text-sm text-gray-600 mt-1">
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
