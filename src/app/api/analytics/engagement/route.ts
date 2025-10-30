import { NextResponse } from 'next/server';
import { createClient } from '~/lib/supabase/server';
import { queryPostHog } from '~/lib/posthog/server';
import { getEngagementMetricsQuery } from '~/lib/posthog/queries';

export const dynamic = 'force-dynamic';

// Cache for 30 seconds
let cachedData: any = null;
let cacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

/**
 * GET /api/analytics/engagement
 * Get user engagement metrics
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

    // Check cache
    const now = Date.now();
    if (cachedData && now - cacheTime < CACHE_DURATION) {
      return NextResponse.json(cachedData);
    }

    // Query PostHog for engagement metrics
    const result = await queryPostHog(getEngagementMetricsQuery());

    // Parse results
    const data = result.results?.[0] || [0, 0, 0, 0, 0];
    const totalInteractions = data[0] || 0;
    const uniqueUsers = data[1] || 0;
    const filterApplications = data[2] || 0;
    const recenterActions = data[3] || 0;
    const clusterClicks = data[4] || 0;

    // Calculate averages
    const avgInteractionsPerUser = uniqueUsers > 0 ? (totalInteractions / uniqueUsers).toFixed(1) : '0.0';

    const responseData = {
      total_interactions: totalInteractions,
      unique_users: uniqueUsers,
      avg_interactions_per_user: parseFloat(avgInteractionsPerUser),
      filter_applications: filterApplications,
      recenter_actions: recenterActions,
      cluster_clicks: clusterClicks,
      neighborhood: process.env.NEXT_PUBLIC_NEIGHBORHOOD_NAME,
    };

    // Update cache
    cachedData = responseData;
    cacheTime = now;

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching engagement metrics:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
