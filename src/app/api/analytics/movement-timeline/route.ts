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

    // Calculate event time window in UTC
    // IMPORTANT: PostHog stores all timestamps in UTC
    // NEXT_PUBLIC_EVENT_START_TIME is in local time (GMT+2 for South Africa)
    // We need to convert to UTC for the query

    // For South Africa (GMT+2): 16:00 local = 14:00 UTC
    // Subtract 2 hours to convert local time to UTC
    const eventStartTimeLocal = process.env.NEXT_PUBLIC_EVENT_START_TIME ?? '16:00';
    const timeParts = eventStartTimeLocal.split(':').map(Number);
    const localHour = timeParts[0] ?? 16;
    const localMinute = timeParts[1] ?? 0;

    // Convert to UTC (South Africa is UTC+2)
    const utcHour = localHour - 2; // Adjust for GMT+2 timezone
    const eventStartUTC = `${dateParam} ${String(utcHour).padStart(2, '0')}:${String(localMinute).padStart(2, '0')}:00`;

    // Query PostHog: Aggregate locations by time_bucket and person_id
    // This gives us one average location per user per 5-minute interval
    // Much more efficient than fetching every single event
    const query = {
      kind: 'HogQLQuery',
      query: `
        SELECT
          toStartOfInterval(timestamp, INTERVAL 5 MINUTE) as time_bucket,
          person_id,
          avg(toFloat(properties.user_lat)) as lat,
          avg(toFloat(properties.user_lng)) as lng,
          count() as event_count
        FROM events
        WHERE timestamp >= toDateTime('${eventStartUTC}') - INTERVAL 30 MINUTE
          AND timestamp <= toDateTime('${eventStartUTC}') + INTERVAL 4 HOUR
          AND properties.neighborhood = '${neighborhoodName}'
          AND properties.user_lat IS NOT NULL
          AND properties.user_lng IS NOT NULL
        GROUP BY time_bucket, person_id
        HAVING lat IS NOT NULL
          AND lng IS NOT NULL
          AND lat >= -90 AND lat <= 90
          AND lng >= -180 AND lng <= 180
        ORDER BY time_bucket, person_id
        LIMIT 10000
      `,
    };

    const result = await queryPostHog(query);

    // Transform results into timeline format
    // Result format: [time_bucket, person_id, lat, lng, event_count]
    // Data is already aggregated per user per interval
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
      const personId = row[1] as string;
      const lat = parseFloat(row[2]);
      const lng = parseFloat(row[3]);
      // row[4] is event_count (number of events aggregated for this user in this bucket)

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
