'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Loader2, Eye, MousePointer, Navigation } from 'lucide-react';

interface JourneyData {
  funnel: {
    map_views: number;
    list_views: number;
    total_views: number;
    marker_clicks: number;
    directions_requested: number;
    unique_users: number;
  };
  conversion_rates: {
    view_to_click: number;
    click_to_directions: number;
  };
  view_modes: Record<string, number>;
}

export function UserJourneyCard() {
  const [data, setData] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/analytics/user-journey');

      if (!response.ok) {
        throw new Error('Failed to fetch user journey data');
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching user journey:', err);
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
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-text-primary">User Journey</h3>
        </div>
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-surface rounded-lg shadow-lg border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-text-primary">User Journey</h3>
        </div>
        <p className="text-sm text-text-secondary text-center">
          {error || 'No journey data yet'}
        </p>
      </div>
    );
  }

  const { funnel, conversion_rates, view_modes } = data;

  return (
    <div className="bg-surface rounded-lg shadow-lg border border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/20 rounded-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">User Journey</h3>
          <p className="text-xs text-text-secondary">Today's funnel</p>
        </div>
      </div>

      {/* Funnel Steps */}
      <div className="space-y-3 mb-6">
        {/* Views */}
        <div className="p-3 bg-background rounded-lg border border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-sm text-text-secondary">Views</span>
            </div>
            <span className="text-lg font-bold text-text-primary">
              {funnel.total_views}
            </span>
          </div>
          <div className="flex gap-2 mt-2 text-xs text-text-secondary">
            <span>Map: {funnel.map_views}</span>
            <span>•</span>
            <span>List: {funnel.list_views}</span>
          </div>
        </div>

        {/* Arrow with conversion rate */}
        <div className="flex items-center justify-center">
          <div className="text-xs text-text-secondary bg-background px-3 py-1 rounded-full border border-gray-800">
            {conversion_rates.view_to_click}% convert
          </div>
        </div>

        {/* Marker Clicks */}
        <div className="p-3 bg-background rounded-lg border border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-primary" />
              <span className="text-sm text-text-secondary">Marker Clicks</span>
            </div>
            <span className="text-lg font-bold text-text-primary">
              {funnel.marker_clicks}
            </span>
          </div>
        </div>

        {/* Arrow with conversion rate */}
        <div className="flex items-center justify-center">
          <div className="text-xs text-text-secondary bg-background px-3 py-1 rounded-full border border-gray-800">
            {conversion_rates.click_to_directions}% get directions
          </div>
        </div>

        {/* Directions */}
        <div className="p-3 bg-background rounded-lg border border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-primary" />
              <span className="text-sm text-text-secondary">Directions</span>
            </div>
            <span className="text-lg font-bold text-text-primary">
              {funnel.directions_requested}
            </span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="pt-4 border-t border-gray-800 text-center">
        <span className="text-xs text-text-secondary">
          {funnel.unique_users} unique {funnel.unique_users === 1 ? 'user' : 'users'}
        </span>
      </div>
    </div>
  );
}
