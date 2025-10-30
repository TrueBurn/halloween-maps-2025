import { NextResponse } from 'next/server';
import { createClient } from '~/lib/supabase/server';
import { queryPostHog } from '~/lib/posthog/server';
import { getUserJourneyQuery, getViewModeQuery } from '~/lib/posthog/queries';

export const dynamic = 'force-dynamic';

// Cache for 30 seconds
let cachedData: any = null;
let cacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

/**
 * GET /api/analytics/user-journey
 * Get user journey funnel and view mode breakdown
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

    // Query PostHog for user journey funnel
    const journeyResult = await queryPostHog(getUserJourneyQuery());
    const viewModeResult = await queryPostHog(getViewModeQuery());

    // Parse journey funnel
    const journeyData = journeyResult.results?.[0] || [0, 0, 0, 0, 0];
    const mapViews = journeyData[0] || 0;
    const listViews = journeyData[1] || 0;
    const markerClicks = journeyData[2] || 0;
    const directionsRequested = journeyData[3] || 0;
    const uniqueUsers = journeyData[4] || 0;

    // Parse view mode breakdown
    const viewModes: Record<string, number> = {};
    (viewModeResult.results || []).forEach((row: any) => {
      const mode = row[0] || 'unknown';
      const views = row[1] || 0;
      viewModes[mode] = views;
    });

    // Calculate conversion rates
    const totalViews = mapViews + listViews;
    const viewToClickRate = totalViews > 0 ? (markerClicks / totalViews) * 100 : 0;
    const clickToDirectionsRate = markerClicks > 0 ? (directionsRequested / markerClicks) * 100 : 0;

    const responseData = {
      funnel: {
        map_views: mapViews,
        list_views: listViews,
        total_views: totalViews,
        marker_clicks: markerClicks,
        directions_requested: directionsRequested,
        unique_users: uniqueUsers,
      },
      conversion_rates: {
        view_to_click: Math.round(viewToClickRate),
        click_to_directions: Math.round(clickToDirectionsRate),
      },
      view_modes: viewModes,
      neighborhood: process.env.NEXT_PUBLIC_NEIGHBORHOOD_NAME,
    };

    // Update cache
    cachedData = responseData;
    cacheTime = now;

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching user journey:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
