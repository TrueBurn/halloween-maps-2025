'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, ArrowRight, Loader2, MapPin } from 'lucide-react';

interface HeatmapData {
  count: number;
  time_window_minutes: number;
}

export function UserHeatmapPreviewCard() {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics/user-heatmap');

        if (!response.ok) {
          throw new Error('Failed to fetch heatmap data');
        }

        const result = await response.json();
        setData({
          count: result.count,
          time_window_minutes: result.time_window_minutes,
        });
      } catch (err) {
        console.error('Error fetching heatmap preview:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  return (
    <Link
      href="/admin/analytics/heatmap"
      className="block bg-surface p-6 rounded-lg border border-gray-700 hover:border-primary transition-colors group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">User Location Heatmap</h3>
            <p className="text-sm text-text-secondary mt-1">
              Real-time map showing active users
            </p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-sm text-error py-4">
          {error}
        </div>
      ) : data ? (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <Users className="h-5 w-5 text-primary mt-1" />
            <div>
              <p className="text-3xl font-bold text-text-primary">
                {data.count}
              </p>
              <p className="text-sm text-text-secondary">
                Active {data.count === 1 ? 'user' : 'users'} with GPS enabled
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-700">
            <p className="text-xs text-text-secondary">
              Last {data.time_window_minutes} minutes • Click to view full heatmap
            </p>
          </div>
        </div>
      ) : null}
    </Link>
  );
}
