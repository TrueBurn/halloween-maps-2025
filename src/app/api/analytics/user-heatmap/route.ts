import { NextResponse } from 'next/server';
import { createClient } from '~/lib/supabase/server';
import { queryPostHog } from '~/lib/posthog/server';
import { getRecentUserLocationsQuery } from '~/lib/posthog/queries';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/user-heatmap
 * Get recent user locations for heatmap visualization
 * Returns anonymized coordinate clusters for admin-only heatmap
 * Requires authentication
 *
 * Query Parameters:
 * - minutes: Number of minutes to look back (default: 5, max: 1440)
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

    // Parse and validate time window parameter
    const { searchParams } = new URL(request.url);
    const minutesParam = searchParams.get('minutes');
    let minutes = 5; // Default to 5 minutes

    if (minutesParam) {
      const parsed = parseInt(minutesParam, 10);
      if (isNaN(parsed) || parsed < 1 || parsed > 1440) {
        return NextResponse.json(
          { error: 'Invalid minutes parameter. Must be between 1 and 1440.' },
          { status: 400 }
        );
      }
      minutes = parsed;
    }

    // Query PostHog for recent user locations
    const result = await queryPostHog(getRecentUserLocationsQuery(minutes));

    // Debug logging
    console.log('[Heatmap API] PostHog result:', {
      hasResults: !!result.results,
      resultCount: result.results?.length ?? 0,
      firstRow: result.results?.[0],
    });

    // Transform results into heatmap-compatible format
    // Result format: [person_id, lat, lng, last_seen]
    type LocationData = { lat: number; lng: number; last_seen: string } | null;

    const locations = (result.results ?? [])
      .map((row: any[]): LocationData => {
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
      .filter((loc: LocationData): loc is { lat: number; lng: number; last_seen: string } => loc !== null);

    return NextResponse.json({
      locations,
      count: locations.length,
      time_window_minutes: minutes,
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
