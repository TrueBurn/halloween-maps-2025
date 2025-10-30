import { NextResponse } from 'next/server';
import { createClient } from '~/lib/supabase/server';
import { queryPostHog } from '~/lib/posthog/server';
import { getLocationTypePerformanceQuery } from '~/lib/posthog/queries';

export const dynamic = 'force-dynamic';

// Cache for 60 seconds
let cachedData: any = null;
let cacheTime = 0;
const CACHE_DURATION = 60000; // 60 seconds

/**
 * GET /api/analytics/location-performance
 * Get location type performance metrics
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

    // Query PostHog for location type performance
    const result = await queryPostHog(getLocationTypePerformanceQuery());

    // Parse results and aggregate by type
    const typeMap: Record<string, { total: number; with_candy: number; without_candy: number }> = {};

    (result.results || []).forEach((row: any) => {
      const locationType = row[0] || 'unknown';
      const hasCandy = row[1];
      const views = row[2] || 0;

      if (!typeMap[locationType]) {
        typeMap[locationType] = { total: 0, with_candy: 0, without_candy: 0 };
      }

      typeMap[locationType].total += views;

      if (hasCandy === true || hasCandy === 'true') {
        typeMap[locationType].with_candy += views;
      } else {
        typeMap[locationType].without_candy += views;
      }
    });

    // Convert to array and sort by total views
    const types = Object.entries(typeMap)
      .map(([type, stats]) => ({
        location_type: type,
        total_views: stats.total,
        with_candy: stats.with_candy,
        without_candy: stats.without_candy,
      }))
      .sort((a, b) => b.total_views - a.total_views);

    const totalViews = types.reduce((sum, t) => sum + t.total_views, 0);

    const responseData = {
      types,
      total_views: totalViews,
      neighborhood: process.env.NEXT_PUBLIC_NEIGHBORHOOD_NAME,
    };

    // Update cache
    cachedData = responseData;
    cacheTime = now;

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching location performance:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
