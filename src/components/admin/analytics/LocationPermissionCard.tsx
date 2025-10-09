'use client';

import { useEffect, useState } from 'react';
import { MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface PermissionStats {
  granted: number;
  denied: number;
  total: number;
  percentage: number;
}

export function LocationPermissionCard() {
  const [stats, setStats] = useState<PermissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/analytics/gps-permissions');

      if (!response.ok) {
        throw new Error('Failed to fetch GPS permission stats');
      }

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching GPS permission stats:', err);
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

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-lg border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-text-primary">Location Access</h3>
        </div>
        <div className="flex items-center justify-center h-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-surface rounded-lg shadow-lg border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-text-primary">Location Access</h3>
        </div>
        <p className="text-sm text-text-secondary text-center">
          {error || 'No data yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-lg border border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/20 rounded-lg">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-semibold text-text-primary">Location Access</h3>
      </div>

      {/* Main Percentage */}
      <div className="mb-4">
        <div className="text-4xl font-bold text-text-primary">
          {stats.percentage}%
        </div>
        <div className="text-sm text-text-secondary">allowed location access</div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-gray-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <span className="text-sm text-text-secondary">Granted</span>
          </div>
          <span className="text-lg font-bold text-text-primary">{stats.granted}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-gray-800">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-error" />
            <span className="text-sm text-text-secondary">Denied</span>
          </div>
          <span className="text-lg font-bold text-text-primary">{stats.denied}</span>
        </div>
      </div>

      {/* Total Users */}
      <div className="mt-4 pt-4 border-t border-gray-800 text-center">
        <span className="text-xs text-text-secondary">
          {stats.total} total {stats.total === 1 ? 'user' : 'users'}
        </span>
      </div>
    </div>
  );
}
