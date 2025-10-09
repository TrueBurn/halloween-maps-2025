'use client';

import { useEffect, useState } from 'react';
import { Eye, Activity, Clock, Smartphone, Monitor, Loader2 } from 'lucide-react';

interface TodayStats {
  total_visitors: number;
  total_sessions: number;
  avg_session_duration_seconds: number;
  device_breakdown: Array<{
    device_type: string;
    users: number;
  }>;
}

export function StatsGrid() {
  const [stats, setStats] = useState<TodayStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/analytics/today');

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStats();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchStats, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getMobileCount = () => {
    if (!stats) return 0;
    return stats.device_breakdown
      .filter((d) => d.device_type.toLowerCase().includes('mobile'))
      .reduce((sum, d) => sum + d.users, 0);
  };

  const getDesktopCount = () => {
    if (!stats) return 0;
    return stats.device_breakdown
      .filter((d) => !d.device_type.toLowerCase().includes('mobile'))
      .reduce((sum, d) => sum + d.users, 0);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-900/50 rounded-lg p-6 border border-gray-800 flex items-center justify-center"
          >
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
        <p className="text-center text-error text-sm">{error || 'No data'}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Visitors */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Eye className="h-4 w-4 text-primary" />
          </div>
          <h4 className="text-sm font-medium text-text-secondary">
            Visitors Today
          </h4>
        </div>
        <div className="text-3xl font-bold text-text-primary">
          {stats.total_visitors}
        </div>
      </div>

      {/* Sessions */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-success/20 rounded-lg">
            <Activity className="h-4 w-4 text-success" />
          </div>
          <h4 className="text-sm font-medium text-text-secondary">
            Sessions
          </h4>
        </div>
        <div className="text-3xl font-bold text-text-primary">
          {stats.total_sessions}
        </div>
      </div>

      {/* Avg Duration */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-warning/20 rounded-lg">
            <Clock className="h-4 w-4 text-warning" />
          </div>
          <h4 className="text-sm font-medium text-text-secondary">
            Avg Duration
          </h4>
        </div>
        <div className="text-3xl font-bold text-text-primary">
          {formatDuration(stats.avg_session_duration_seconds)}
        </div>
      </div>

      {/* Device Breakdown */}
      {stats.device_breakdown.length > 0 && (
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800 md:col-span-3">
          <h4 className="text-sm font-medium text-text-secondary mb-4">
            Device Breakdown
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xl font-bold text-text-primary">
                  {getMobileCount()}
                </div>
                <div className="text-xs text-text-secondary">Mobile</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-success" />
              <div>
                <div className="text-xl font-bold text-text-primary">
                  {getDesktopCount()}
                </div>
                <div className="text-xs text-text-secondary">Desktop</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
