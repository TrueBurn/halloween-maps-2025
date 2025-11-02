'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ChevronLeft, Loader2, Users, Clock, TrendingUp, Calendar } from 'lucide-react';
import { createClient } from '~/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const TimelineMapPlayback = dynamic(
  () => import('~/components/admin/analytics/TimelineMapPlayback').then((mod) => ({ default: mod.TimelineMapPlayback })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-surface rounded-lg border border-gray-700">
        <div className="text-text-secondary">Loading timeline...</div>
      </div>
    ),
  }
);

interface TimelineData {
  timeline: Array<{
    time_bucket: string;
    locations: Array<{ lat: number; lng: number }>;
    user_count: number;
    center_lat: number;
    center_lng: number;
  }>;
  summary: {
    total_unique_users: number;
    total_intervals: number;
    peak_user_count: number;
    peak_time: string;
    event_start: string | null;
    event_end: string | null;
    date: string;
    neighborhood: string;
  };
  last_updated: string;
}

export default function MovementTimelinePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TimelineData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check current auth session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/admin/login');
      } else {
        setUser(user);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push('/admin/login');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  // Fetch timeline data
  useEffect(() => {
    if (!user) return;

    const fetchTimelineData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch timeline for event date (from NEXT_PUBLIC_EVENT_DATE env var)
        const response = await fetch('/api/analytics/movement-timeline');

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result: TimelineData = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching timeline data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load timeline data');
      } finally {
        setLoading(false);
      }
    };

    void fetchTimelineData();
  }, [user]);

  // Format time for display
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-text-primary flex flex-col">
      {/* Header - compact */}
      <header className="bg-surface border-b border-gray-700 px-6 py-2 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/analytics"
                className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Back to Analytics</span>
              </Link>
              <div className="h-6 w-px bg-gray-700" />
              <h1 className="text-xl font-bold">Movement Timeline</h1>
              {data && (
                <span className="text-sm text-text-secondary">
                  Halloween {data.summary.date}
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary hidden sm:block">
              Animated replay of user movement patterns during the event
            </p>
          </div>
        </div>
      </header>

      {/* Summary Stats - compact */}
      {data && !error && (
        <div className="bg-background px-6 py-2 border-b border-gray-700 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Total Users */}
              <div className="bg-surface px-3 py-2 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-text-secondary">Total Users</p>
                    <p className="text-lg font-bold text-text-primary">{data.summary.total_unique_users}</p>
                  </div>
                </div>
              </div>

              {/* Total Intervals */}
              <div className="bg-surface px-3 py-2 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-secondary" />
                  <div>
                    <p className="text-xs text-text-secondary">Time Intervals</p>
                    <p className="text-lg font-bold text-text-primary">{data.summary.total_intervals}</p>
                  </div>
                </div>
              </div>

              {/* Peak Activity */}
              <div className="bg-surface px-3 py-2 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-warning" />
                  <div>
                    <p className="text-xs text-text-secondary">Peak Activity</p>
                    <p className="text-lg font-bold text-text-primary">
                      {data.summary.peak_user_count} @ {data.summary.peak_time ? formatTime(data.summary.peak_time) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Duration */}
              <div className="bg-surface px-3 py-2 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-success" />
                  <div>
                    <p className="text-xs text-text-secondary">Event Duration</p>
                    <p className="text-sm font-bold text-text-primary">
                      {data.summary.event_start && data.summary.event_end
                        ? `${formatTime(data.summary.event_start)} - ${formatTime(data.summary.event_end)}`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-surface px-6 py-4 rounded-lg border border-error max-w-md text-center">
            <p className="text-error font-medium mb-2">Error Loading Timeline</p>
            <p className="text-sm text-text-secondary">{error}</p>
          </div>
        </div>
      )}

      {/* Timeline Map */}
      {data && !error && (
        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full max-w-7xl mx-auto">
            <TimelineMapPlayback data={data} />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-text-secondary">Loading timeline data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
