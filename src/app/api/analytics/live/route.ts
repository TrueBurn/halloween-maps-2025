import { NextResponse } from 'next/server';
import { createClient } from '~/lib/supabase/server';
import { queryPostHog } from '~/lib/posthog/server';
import { getActiveUsersQuery } from '~/lib/posthog/queries';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/live
 * Get active users in the last 5 minutes
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

    // Query PostHog for active users
    const result = await queryPostHog(getActiveUsersQuery(5));

    const activeUsers = result.results?.[0]?.[0] ?? 0;

    return NextResponse.json({
      active_users: activeUsers,
      time_window_minutes: 5,
      neighborhood: process.env.NEXT_PUBLIC_NEIGHBORHOOD_NAME,
    });
  } catch (error) {
    console.error('Error fetching live analytics:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
