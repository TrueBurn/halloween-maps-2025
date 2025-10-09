import { NextResponse } from 'next/server';
import { createClient } from '~/lib/supabase/server';
import { queryPostHog } from '~/lib/posthog/server';
import {
  getTodayVisitorsQuery,
  getTodaySessionMetricsQuery,
  getDeviceBreakdownQuery,
} from '~/lib/posthog/queries';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/today
 * Get analytics for today (visitors, sessions, device breakdown)
 * Requires authentication
 */
export async function GET() {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run all queries in parallel
    const [visitorsResult, sessionsResult, devicesResult] = await Promise.all([
      queryPostHog(getTodayVisitorsQuery()),
      queryPostHog(getTodaySessionMetricsQuery()),
      queryPostHog(getDeviceBreakdownQuery()),
    ]);

    // Parse results
    const totalVisitors = visitorsResult.results?.[0]?.[0] ?? 0;

    const sessions = sessionsResult.results || [];
    const totalSessions = sessions.length;
    const avgDuration =
      sessions.length > 0
        ? sessions.reduce((sum: number, row: any) => sum + (row[1] || 0), 0) / sessions.length
        : 0;

    const deviceBreakdown = (devicesResult.results || []).map((row: any) => ({
      device_type: row[0] || 'Unknown',
      users: row[1] || 0,
    }));

    return NextResponse.json({
      total_visitors: totalVisitors,
      total_sessions: totalSessions,
      avg_session_duration_seconds: Math.round(avgDuration),
      device_breakdown: deviceBreakdown,
      neighborhood: process.env.NEXT_PUBLIC_NEIGHBORHOOD_NAME,
    });
  } catch (error) {
    console.error('Error fetching today analytics:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
