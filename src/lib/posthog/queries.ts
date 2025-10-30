/**
 * PostHog HogQL Query Helpers
 * Automatically includes neighborhood filtering for all queries
 */

const neighborhoodName = process.env.NEXT_PUBLIC_NEIGHBORHOOD_NAME ?? 'Unknown';

/**
 * Get active users in the last N minutes
 */
export function getActiveUsersQuery(minutes: number = 5) {
  return {
    kind: 'HogQLQuery',
    query: `
      SELECT count(DISTINCT person_id) as active_users
      FROM events
      WHERE timestamp >= now() - INTERVAL ${minutes} MINUTE
        AND properties.neighborhood = '${neighborhoodName}'
    `,
  };
}

/**
 * Get total unique visitors today
 */
export function getTodayVisitorsQuery() {
  return {
    kind: 'HogQLQuery',
    query: `
      SELECT count(DISTINCT person_id) as visitors
      FROM events
      WHERE timestamp >= today()
        AND properties.neighborhood = '${neighborhoodName}'
    `,
  };
}

/**
 * Get session metrics for today
 * Returns duration for each session (API route calculates average)
 */
export function getTodaySessionMetricsQuery() {
  return {
    kind: 'HogQLQuery',
    query: `
      SELECT
        properties.$session_id as session_id,
        dateDiff('second', min(timestamp), max(timestamp)) as duration_seconds
      FROM events
      WHERE timestamp >= today()
        AND properties.neighborhood = '${neighborhoodName}'
        AND properties.$session_id IS NOT NULL
      GROUP BY properties.$session_id
    `,
  };
}

/**
 * Get device breakdown (mobile vs desktop)
 */
export function getDeviceBreakdownQuery() {
  return {
    kind: 'HogQLQuery',
    query: `
      SELECT
        properties.$device_type as device_type,
        count(DISTINCT person_id) as users
      FROM events
      WHERE timestamp >= today()
        AND properties.neighborhood = '${neighborhoodName}'
        AND event = '$pageview'
      GROUP BY properties.$device_type
      ORDER BY users DESC
    `,
  };
}

/**
 * Get most clicked locations today (top N)
 */
export function getPopularLocationsQuery(limit: number = 10) {
  return {
    kind: 'HogQLQuery',
    query: `
      SELECT
        properties.address as address,
        properties.location_type as location_type,
        properties.has_candy as has_candy,
        count(*) as clicks
      FROM events
      WHERE event = 'map_marker_clicked'
        AND properties.neighborhood = '${neighborhoodName}'
        AND timestamp >= today()
      GROUP BY properties.address, properties.location_type, properties.has_candy
      ORDER BY clicks DESC
      LIMIT ${limit}
    `,
  };
}

/**
 * Get most clicked locations all time (top N)
 */
export function getPopularLocationsAllTimeQuery(limit: number = 10) {
  return {
    kind: 'HogQLQuery',
    query: `
      SELECT
        properties.address as address,
        properties.location_type as location_type,
        properties.has_candy as has_candy,
        count(*) as clicks
      FROM events
      WHERE event = 'map_marker_clicked'
        AND properties.neighborhood = '${neighborhoodName}'
      GROUP BY properties.address, properties.location_type, properties.has_candy
      ORDER BY clicks DESC
      LIMIT ${limit}
    `,
  };
}

/**
 * Get event counts by type for today
 */
export function getEventCountsQuery() {
  return {
    kind: 'HogQLQuery',
    query: `
      SELECT
        event,
        count(*) as count
      FROM events
      WHERE timestamp >= today()
        AND properties.neighborhood = '${neighborhoodName}'
        AND event NOT LIKE '$%'
      GROUP BY event
      ORDER BY count DESC
      LIMIT 20
    `,
  };
}

/**
 * Get recent activity (last N events)
 */
export function getRecentActivityQuery(limit: number = 20) {
  return {
    kind: 'HogQLQuery',
    query: `
      SELECT
        event,
        timestamp,
        properties.address as address,
        properties.location_type as location_type
      FROM events
      WHERE properties.neighborhood = '${neighborhoodName}'
        AND event NOT LIKE '$%'
        AND timestamp >= now() - INTERVAL 1 HOUR
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `,
  };
}

/**
 * Get filter usage stats
 */
export function getFilterUsageQuery() {
  return {
    kind: 'HogQLQuery',
    query: `
      SELECT
        properties.filter_type as filter_type,
        properties.filter_value as filter_value,
        count(*) as usage_count
      FROM events
      WHERE event = 'location_filter_applied'
        AND properties.neighborhood = '${neighborhoodName}'
        AND timestamp >= today()
      GROUP BY properties.filter_type, properties.filter_value
      ORDER BY usage_count DESC
      LIMIT 10
    `,
  };
}

/**
 * Get GPS permission stats (granted vs denied)
 */
export function getGPSPermissionStatsQuery() {
  return {
    kind: 'HogQLQuery',
    query: `
      SELECT
        if(properties.granted = true, 'granted', 'denied') as status,
        count(DISTINCT person_id) as users
      FROM events
      WHERE event = 'map_user_location_enabled'
        AND properties.neighborhood = '${neighborhoodName}'
      GROUP BY properties.granted
      ORDER BY users DESC
    `,
  };
}
