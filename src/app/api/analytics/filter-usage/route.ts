import { NextResponse } from 'next/server';
import { createClient } from '~/lib/supabase/server';
import { queryPostHog } from '~/lib/posthog/server';
import { getFilterUsageQuery } from '~/lib/posthog/queries';

export const dynamic = 'force-dynamic';

// Cache for 30 seconds
let cachedData: any = null;
let cacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

/**
 * GET /api/analytics/filter-usage
 * Get most used filters today
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

    // Query PostHog for filter usage
    const result = await queryPostHog(getFilterUsageQuery());

    const filters = (result.results || []).map((row: any) => ({
      filter_type: row[0] || 'unknown',
      filter_value: row[1] || 'unknown',
      usage_count: row[2] || 0,
    }));

    const responseData = {
      filters,
      total: filters.reduce((sum: number, f: any) => sum + f.usage_count, 0),
      neighborhood: process.env.NEXT_PUBLIC_NEIGHBORHOOD_NAME,
    };

    // Update cache
    cachedData = responseData;
    cacheTime = now;

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching filter usage:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
