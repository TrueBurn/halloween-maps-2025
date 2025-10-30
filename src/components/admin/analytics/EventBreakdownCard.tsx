'use client';

import { useEffect, useState } from 'react';
import { Activity, Loader2 } from 'lucide-react';

interface EventCount {
  event: string;
  count: number;
}

export function EventBreakdownCard() {
  const [events, setEvents] = useState<EventCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/analytics/event-breakdown');

      if (!response.ok) {
        throw new Error('Failed to fetch event breakdown');
      }

      const data = await response.json();
      setEvents(data.events || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching event breakdown:', err);
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchEvents();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchEvents, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-lg border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-text-primary">Event Breakdown</h3>
        </div>
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || events.length === 0) {
    return (
      <div className="bg-surface rounded-lg shadow-lg border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-text-primary">Event Breakdown</h3>
        </div>
        <p className="text-sm text-text-secondary text-center">
          {error || 'No event data yet'}
        </p>
      </div>
    );
  }

  const totalEvents = events.reduce((sum, e) => sum + e.count, 0);
  const maxCount = Math.max(...events.map(e => e.count));

  return (
    <div className="bg-surface rounded-lg shadow-lg border border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Activity className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">Event Breakdown</h3>
          <p className="text-xs text-text-secondary">{totalEvents} total events today</p>
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {events.map((event, index) => {
          const percentage = (event.count / maxCount) * 100;

          return (
            <div key={`${event.event}-${index}`} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-primary truncate flex-1 mr-2">
                  {event.event}
                </span>
                <span className="text-sm font-bold text-text-primary">
                  {event.count}
                </span>
              </div>
              <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
