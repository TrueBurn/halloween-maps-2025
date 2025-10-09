'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, MapPin, Loader2 } from 'lucide-react';

interface Location {
  address: string;
  location_type: string;
  has_candy: boolean;
  clicks: number;
}

type Timeframe = 'today' | 'all-time';

export function PopularLocations() {
  const [timeframe, setTimeframe] = useState<Timeframe>('today');
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async (selectedTimeframe: Timeframe) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/popular-locations?limit=10&timeframe=${selectedTimeframe}`);

      if (!response.ok) {
        throw new Error('Failed to fetch popular locations');
      }

      const data = await response.json();
      setLocations(data.locations);
      setError(null);
    } catch (err) {
      console.error('Error fetching popular locations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchLocations(timeframe);

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => fetchLocations(timeframe), 60000);

    return () => clearInterval(interval);
  }, [timeframe]);

  return (
    <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-warning/20 rounded-lg">
            <TrendingUp className="h-4 w-4 text-warning" />
          </div>
          <h3 className="font-semibold text-text-primary">
            Most Viewed Locations
          </h3>
        </div>

        {/* Timeframe Tabs */}
        <div className="flex gap-2 bg-background rounded-lg p-1 border border-gray-800">
          <button
            onClick={() => setTimeframe('today')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              timeframe === 'today'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeframe('all-time')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              timeframe === 'all-time'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Error or Empty State */}
      {!loading && (error || locations.length === 0) && (
        <p className="text-center text-text-secondary text-sm py-8">
          {error || `No location views yet ${timeframe === 'today' ? 'today' : 'recorded'}`}
        </p>
      )}

      {/* Locations List */}
      {!loading && !error && locations.length > 0 && (

        <div className="space-y-3">
          {locations.map((location, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-background rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm flex-shrink-0">
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-text-secondary flex-shrink-0" />
                    <span className="font-medium text-text-primary truncate">
                      {location.address}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-text-secondary">
                      {location.location_type}
                    </span>
                    {location.has_candy && (
                      <>
                        <span className="text-gray-600">•</span>
                        <span className="text-xs text-success">Has Candy</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <div className="text-right">
                  <div className="text-lg font-bold text-text-primary">
                    {location.clicks}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {location.clicks === 1 ? 'view' : 'views'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
