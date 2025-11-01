import { NextResponse } from 'next/server';
import { createClient } from '~/lib/supabase/server';
import { queryPostHog } from '~/lib/posthog/server';
import { getRecentUserLocationsQuery } from '~/lib/posthog/queries';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/user-heatmap
 * Get recent user locations for heatmap visualization (last 5 minutes)
 * Returns anonymized coordinate clusters for admin-only heatmap
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

    // Query PostHog for recent user locations (last 5 minutes)
    const result = await queryPostHog(getRecentUserLocationsQuery(5));

    // Transform results into heatmap-compatible format
    // Result format: [person_id, lat, lng, last_seen]
    const locations = (result.results ?? [])
      .map((row: any[]) => {
        const lat = parseFloat(row[1]);
        const lng = parseFloat(row[2]);
        const lastSeen = row[3];

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng)) return null;
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

        return {
          lat,
          lng,
          last_seen: lastSeen,
        };
      })
      .filter((loc): loc is { lat: number; lng: number; last_seen: string } => loc !== null);

    return NextResponse.json({
      locations,
      count: locations.length,
      time_window_minutes: 5,
      neighborhood: process.env.NEXT_PUBLIC_NEIGHBORHOOD_NAME,
      last_updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching user heatmap data:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch heatmap data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
