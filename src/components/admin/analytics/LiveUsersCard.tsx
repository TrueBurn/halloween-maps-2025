'use client';

import { useEffect, useState } from 'react';
import { Users, Loader2 } from 'lucide-react';

export function LiveUsersCard() {
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveUsers = async () => {
    try {
      const response = await fetch('/api/analytics/live');

      if (!response.ok) {
        throw new Error('Failed to fetch live users');
      }

      const data = await response.json();
      setActiveUsers(data.active_users);
      setError(null);
    } catch (err) {
      console.error('Error fetching live users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchLiveUsers();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLiveUsers, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-text-primary">Live Now</h3>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-text-secondary">Live</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center text-error text-sm">{error}</div>
      ) : (
        <div>
          <div className="text-4xl font-bold text-text-primary mb-1">
            {activeUsers}
          </div>
          <p className="text-sm text-text-secondary">
            Active {activeUsers === 1 ? 'user' : 'users'} (last 5 min)
          </p>
        </div>
      )}
    </div>
  );
}
