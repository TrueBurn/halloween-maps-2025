'use client';

import { useEffect, useState } from 'react';
import { Clock, Loader2 } from 'lucide-react';

interface Activity {
  event: string;
  timestamp: string;
  address?: string;
  location_type?: string;
}

export function RecentActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/analytics/recent-activity');

      if (!response.ok) {
        throw new Error('Failed to fetch recent activity');
      }

      const data = await response.json();
      setActivities(data.activities || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching recent activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchActivities();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  const formatEventName = (event: string) => {
    // Convert snake_case to Title Case
    return event
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-lg border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-text-primary">Recent Activity</h3>
        </div>
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || activities.length === 0) {
    return (
      <div className="bg-surface rounded-lg shadow-lg border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-text-primary">Recent Activity</h3>
        </div>
        <p className="text-sm text-text-secondary text-center">
          {error || 'No recent activity'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-lg border border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">Recent Activity</h3>
          <p className="text-xs text-text-secondary">Last hour</p>
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {activities.map((activity, index) => (
          <div
            key={`${activity.event}-${activity.timestamp}-${index}`}
            className="p-3 bg-background rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {formatEventName(activity.event)}
                </p>
                {activity.address && (
                  <p className="text-xs text-text-secondary truncate mt-0.5">
                    {activity.address}
                    {activity.location_type && ` (${activity.location_type})`}
                  </p>
                )}
              </div>
              <span className="text-xs text-text-secondary whitespace-nowrap">
                {formatTime(activity.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
