import { NextResponse } from 'next/server';
import { createClient } from '~/lib/supabase/server';
import { queryPostHog } from '~/lib/posthog/server';
import { getPopularLocationsQuery } from '~/lib/posthog/queries';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/popular-locations
 * Get most clicked locations today
 * Requires authentication
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get limit from query params (default: 10)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Query PostHog
    const result = await queryPostHog(getPopularLocationsQuery(limit));

    const locations = (result.results || []).map((row: any) => ({
      address: row[0] || 'Unknown',
      location_type: row[1] || 'Unknown',
      has_candy: row[2] ?? false,
      clicks: row[3] || 0,
    }));

    return NextResponse.json({
      locations,
      neighborhood: process.env.NEXT_PUBLIC_NEIGHBORHOOD_NAME,
    });
  } catch (error) {
    console.error('Error fetching popular locations:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
