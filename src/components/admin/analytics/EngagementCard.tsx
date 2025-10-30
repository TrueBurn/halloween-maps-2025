'use client';

import { useEffect, useState } from 'react';
import { Zap, Loader2 } from 'lucide-react';

interface EngagementData {
  total_interactions: number;
  unique_users: number;
  avg_interactions_per_user: number;
  filter_applications: number;
  recenter_actions: number;
  cluster_clicks: number;
}

export function EngagementCard() {
  const [data, setData] = useState<EngagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/analytics/engagement');

      if (!response.ok) {
        throw new Error('Failed to fetch engagement data');
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching engagement:', err);
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-lg border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-text-primary">Engagement</h3>
        </div>
        <div className="flex items-center justify-center h-32">
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
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-text-primary">Engagement</h3>
        </div>
        <p className="text-sm text-text-secondary text-center">
          {error || 'No engagement data yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-lg border border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">Engagement</h3>
          <p className="text-xs text-text-secondary">User interactions today</p>
        </div>
      </div>

      {/* Main Metric */}
      <div className="mb-4">
        <div className="text-4xl font-bold text-text-primary">
          {data.avg_interactions_per_user}
        </div>
        <div className="text-sm text-text-secondary">avg interactions per user</div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-background rounded-lg border border-gray-800">
          <div className="text-lg font-bold text-text-primary">
            {data.filter_applications}
          </div>
          <div className="text-xs text-text-secondary">Filters applied</div>
        </div>

        <div className="p-3 bg-background rounded-lg border border-gray-800">
          <div className="text-lg font-bold text-text-primary">
            {data.recenter_actions}
          </div>
          <div className="text-xs text-text-secondary">Recenters</div>
        </div>

        <div className="p-3 bg-background rounded-lg border border-gray-800">
          <div className="text-lg font-bold text-text-primary">
            {data.cluster_clicks}
          </div>
          <div className="text-xs text-text-secondary">Cluster clicks</div>
        </div>

        <div className="p-3 bg-background rounded-lg border border-gray-800">
          <div className="text-lg font-bold text-text-primary">
            {data.total_interactions}
          </div>
          <div className="text-xs text-text-secondary">Total actions</div>
        </div>
      </div>
    </div>
  );
}
