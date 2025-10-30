'use client';

import { useEffect, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationType {
  location_type: string;
  total_views: number;
  with_candy: number;
  without_candy: number;
}

interface LocationPerformanceData {
  types: LocationType[];
  total_views: number;
}

export function LocationTypeCard() {
  const [data, setData] = useState<LocationPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/analytics/location-performance');

      if (!response.ok) {
        throw new Error('Failed to fetch location performance');
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching location performance:', err);
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-lg border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-text-primary">Location Types</h3>
        </div>
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !data || data.types.length === 0) {
    return (
      <div className="bg-surface rounded-lg shadow-lg border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-text-primary">Location Types</h3>
        </div>
        <p className="text-sm text-text-secondary text-center">
          {error || 'No location data yet'}
        </p>
      </div>
    );
  }

  const maxViews = Math.max(...data.types.map(t => t.total_views));

  return (
    <div className="bg-surface rounded-lg shadow-lg border border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/20 rounded-lg">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">Location Types</h3>
          <p className="text-xs text-text-secondary">{data.total_views} total views today</p>
        </div>
      </div>

      <div className="space-y-3">
        {data.types.map((type, index) => {
          const percentage = (type.total_views / maxViews) * 100;

          return (
            <div key={`${type.location_type}-${index}`} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">
                  {type.location_type}
                </span>
                <span className="text-sm font-bold text-text-primary">
                  {type.total_views}
                </span>
              </div>

              {/* Bar */}
              <div className="w-full bg-background rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Candy breakdown */}
              {(type.with_candy > 0 || type.without_candy > 0) && (
                <div className="flex gap-3 text-xs text-text-secondary ml-1">
                  {type.with_candy > 0 && (
                    <span>
                      With candy: {type.with_candy}
                    </span>
                  )}
                  {type.without_candy > 0 && (
                    <span>
                      Without: {type.without_candy}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
