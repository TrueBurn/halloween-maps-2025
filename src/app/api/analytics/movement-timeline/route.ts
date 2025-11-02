import { NextResponse } from 'next/server';
import { createClient } from '~/lib/supabase/server';
import { queryPostHog } from '~/lib/posthog/server';

export const dynamic = 'force-dynamic';

const neighborhoodName = process.env.NEXT_PUBLIC_NEIGHBORHOOD_NAME ?? 'Unknown';

/**
 * GET /api/analytics/movement-timeline
 * Get user movement data grouped by 5-minute intervals for a specific date
 * Returns timeline data for animated playback of user cluster movement
 * Requires authentication
 *
 * Query Parameters:
 * - date: Date to analyze (default: NEXT_PUBLIC_EVENT_DATE env var, format: YYYY-MM-DD)
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

    // Parse date parameter (default to event date from env)
    const defaultDate = process.env.NEXT_PUBLIC_EVENT_DATE ?? '2025-10-31';
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date') ?? defaultDate;

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    // Query PostHog for user locations grouped by 5-minute intervals
    // Use a broader time range to account for timezone differences
    // Query from 6 hours before to 6 hours after the event date in UTC
    const startDate = `${dateParam} 00:00:00`;
    const endDate = `${dateParam} 23:59:59`;

    const query = {
      kind: 'HogQLQuery',
      query: `
        SELECT
          toStartOfInterval(timestamp, INTERVAL 5 MINUTE) as time_bucket,
          toFloat(properties.user_lat) as lat,
          toFloat(properties.user_lng) as lng,
          person_id
        FROM events
        WHERE timestamp >= toDateTime('${startDate}') - INTERVAL 6 HOUR
          AND timestamp <= toDateTime('${endDate}') + INTERVAL 6 HOUR
          AND properties.neighborhood = '${neighborhoodName}'
          AND properties.user_lat IS NOT NULL
          AND properties.user_lng IS NOT NULL
          AND lat IS NOT NULL
          AND lng IS NOT NULL
          AND lat >= -90 AND lat <= 90
          AND lng >= -180 AND lng <= 180
        ORDER BY time_bucket, person_id
      `,
    };

    const result = await queryPostHog(query);

    // Debug logging
    console.log('[Movement Timeline API] PostHog result:', {
      hasResults: !!result.results,
      resultCount: result.results?.length ?? 0,
      firstRow: result.results?.[0],
      lastRow: result.results?.[result.results?.length - 1],
      sampleRows: result.results?.slice(0, 5),
    });

    // Transform results into timeline format
    // Result format: [time_bucket, lat, lng, person_id]
    interface TimelineInterval {
      time_bucket: string;
      locations: Array<{ lat: number; lng: number }>;
      user_count: number;
      center_lat: number;
      center_lng: number;
    }

    const intervalsMap = new Map<string, { locations: Array<{ lat: number; lng: number }>; users: Set<string> }>();

    (result.results ?? []).forEach((row: any[]) => {
      const timeBucket = row[0] as string;
      const lat = parseFloat(row[1]);
      const lng = parseFloat(row[2]);
      const personId = row[3] as string;

      // Validate coordinates
      if (isNaN(lat) || isNaN(lng)) return;
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;

      if (!intervalsMap.has(timeBucket)) {
        intervalsMap.set(timeBucket, { locations: [], users: new Set() });
      }

      const interval = intervalsMap.get(timeBucket)!;
      interval.locations.push({ lat, lng });
      interval.users.add(personId);
    });

    // Convert map to sorted array
    const timeline: TimelineInterval[] = Array.from(intervalsMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([timeBucket, data]) => {
        // Calculate center point (average lat/lng)
        const avgLat = data.locations.reduce((sum, loc) => sum + loc.lat, 0) / data.locations.length;
        const avgLng = data.locations.reduce((sum, loc) => sum + loc.lng, 0) / data.locations.length;

        return {
          time_bucket: timeBucket,
          locations: data.locations,
          user_count: data.users.size,
          center_lat: avgLat,
          center_lng: avgLng,
        };
      });

    // Calculate summary statistics
    const allUsers = new Set<string>();
    let peakUserCount = 0;
    let peakTimeBucket = '';
    let minTimestamp: string | null = null;
    let maxTimestamp: string | null = null;

    // Track actual min/max timestamps from raw results
    (result.results ?? []).forEach((row: any[]) => {
      const timeBucket = row[0] as string; // time_bucket is first column (ISO string)
      if (!minTimestamp || timeBucket < minTimestamp) {
        minTimestamp = timeBucket;
      }
      if (!maxTimestamp || timeBucket > maxTimestamp) {
        maxTimestamp = timeBucket;
      }
    });

    intervalsMap.forEach((data, timeBucket) => {
      data.users.forEach((user) => allUsers.add(user));
      if (data.users.size > peakUserCount) {
        peakUserCount = data.users.size;
        peakTimeBucket = timeBucket;
      }
    });

    const summary = {
      total_unique_users: allUsers.size,
      total_intervals: timeline.length,
      peak_user_count: peakUserCount,
      peak_time: peakTimeBucket,
      event_start: minTimestamp,
      event_end: maxTimestamp,
      date: dateParam,
      neighborhood: neighborhoodName,
    };

    console.log('[Movement Timeline API] Summary calculated:', {
      totalIntervals: timeline.length,
      uniqueUsers: allUsers.size,
      minTimestamp,
      maxTimestamp,
      peakTime: peakTimeBucket,
      peakCount: peakUserCount,
    });

    return NextResponse.json({
      timeline,
      summary,
      last_updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching movement timeline data:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch timeline data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
