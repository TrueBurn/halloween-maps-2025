'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, MapPin, Loader2 } from 'lucide-react';

interface Location {
  address: string;
  location_type: string;
  has_candy: boolean;
  clicks: number;
}

export function PopularLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/analytics/popular-locations?limit=10');

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
    fetchLocations();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchLocations, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-warning/20 rounded-lg">
            <TrendingUp className="h-4 w-4 text-warning" />
          </div>
          <h3 className="font-semibold text-text-primary">
            Most Viewed Locations Today
          </h3>
        </div>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || locations.length === 0) {
    return (
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-warning/20 rounded-lg">
            <TrendingUp className="h-4 w-4 text-warning" />
          </div>
          <h3 className="font-semibold text-text-primary">
            Most Viewed Locations Today
          </h3>
        </div>
        <p className="text-center text-text-secondary text-sm">
          {error || 'No location views yet today'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-warning/20 rounded-lg">
          <TrendingUp className="h-4 w-4 text-warning" />
        </div>
        <h3 className="font-semibold text-text-primary">
          Most Viewed Locations Today
        </h3>
      </div>

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
    </div>
  );
}
