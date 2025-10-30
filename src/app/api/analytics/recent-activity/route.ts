import { NextResponse } from 'next/server';
import { createClient } from '~/lib/supabase/server';
import { queryPostHog } from '~/lib/posthog/server';
import { getRecentActivityQuery } from '~/lib/posthog/queries';

export const dynamic = 'force-dynamic';

// Cache for 30 seconds
let cachedData: any = null;
let cacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

/**
 * GET /api/analytics/recent-activity
 * Get recent activity (last hour)
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

    // Query PostHog for recent activity
    const result = await queryPostHog(getRecentActivityQuery());

    const activities = (result.results || []).map((row: any) => ({
      event: row[0] || 'unknown',
      timestamp: row[1] || new Date().toISOString(),
      address: row[2] || null,
      location_type: row[3] || null,
    }));

    const responseData = {
      activities,
      count: activities.length,
      neighborhood: process.env.NEXT_PUBLIC_NEIGHBORHOOD_NAME,
    };

    // Update cache
    cachedData = responseData;
    cacheTime = now;

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
