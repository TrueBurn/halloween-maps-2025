import { NextResponse } from 'next/server';
import { createClient } from '~/lib/supabase/server';
import { queryPostHog } from '~/lib/posthog/server';
import { getEventCountsQuery } from '~/lib/posthog/queries';

export const dynamic = 'force-dynamic';

// Cache for 30 seconds
let cachedData: any = null;
let cacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

/**
 * GET /api/analytics/event-breakdown
 * Get event counts by type for today
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

    // Query PostHog for event counts
    const result = await queryPostHog(getEventCountsQuery());

    const events = (result.results || []).map((row: any) => ({
      event: row[0] || 'unknown',
      count: row[1] || 0,
    }));

    const responseData = {
      events,
      total: events.reduce((sum: number, e: any) => sum + e.count, 0),
      neighborhood: process.env.NEXT_PUBLIC_NEIGHBORHOOD_NAME,
    };

    // Update cache
    cachedData = responseData;
    cacheTime = now;

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching event breakdown:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
