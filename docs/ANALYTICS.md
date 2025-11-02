# PostHog Analytics Integration

## Overview

The Halloween Maps app includes **optional** PostHog analytics integration for tracking visitor behavior and engagement metrics. All analytics data is automatically filtered by neighborhood, ensuring complete data isolation between deployments.

**Status:** ✅ Fully Implemented (Optional Feature)

---

## Features

### Real-Time Analytics Dashboard (Admin Only)

Located in the admin panel at `/admin`, the analytics dashboard provides:

**Live Metrics:**
- 🔴 **Active Users** - Visitors active in the last 5 minutes (auto-refresh: 30 seconds)
- 👥 **Total Visitors Today** - Unique visitors since midnight
- 📊 **Total Sessions** - Browsing sessions today
- ⏱️ **Average Session Duration** - Time spent on site
- 📱 **Device Breakdown** - Mobile vs Desktop usage

**Popular Locations:**
- Top 10 most-clicked locations today
- View counts, candy status, and location type
- Real-time updates

**Features:**
- Collapsible dashboard (default: expanded)
- Auto-refresh intervals (30-60 seconds)
- Dark Halloween theme
- Loading states and error handling

### Real-Time User Location Heatmap (Admin Only)

Located at `/admin/analytics/heatmap`, the heatmap provides a privacy-focused visualization of active users:

**Features:**
- 🗺️ **Heat Density Visualization** - Blurred heatmap showing user concentration
- 🎨 **Halloween-Themed Gradient** - Indigo → Pink → Orange color scheme
- 🔒 **Privacy-First Design** - Configurable time window (5-1440 minutes), admin-only access, anonymized clusters
- ⏱️ **Time Range Selector** - Preset options (5min, 15min, 30min, 1hr, 24hr) plus custom input
- 🔄 **Manual Refresh** - Click to update (no auto-polling)
- 📊 **Active User Count** - Shows number of users with GPS enabled
- 🎯 **Auto-Fit Bounds** - Map automatically centers on user locations

**Preview Card on Dashboard:**
- Shows current active user count (last 5 minutes)
- Links to full-screen heatmap
- Refreshes with dashboard

**Technical Details:**
- Uses `leaflet.heat` plugin for smooth visualization
- Queries PostHog for user coordinates from configurable time window
- Groups by person_id to show one location per user (most recent)
- Radius: 25px, Blur: 15px, Max zoom: 17
- API endpoint: `/api/analytics/user-heatmap?minutes=<1-1440>`

### Movement Timeline Playback (Admin Only)

Located at `/admin/analytics/movement-timeline`, the timeline provides an animated visualization of user movement patterns during the Halloween event:

**Features:**
- 🎬 **Animated Playback** - Watch user clusters move in 5-minute intervals
- ⏯️ **Full Playback Controls** - Play/pause, previous/next, speed adjustment (0.5x, 1x, 2x, 4x)
- 🔒 **Map Lock Toggle** - Prevent view jumping when users move far away
- 📊 **Summary Statistics** - Total users, time intervals, peak activity time, event duration
- 🎨 **Halloween-Themed Heatmap** - Indigo → Pink → Orange gradient
- 🗓️ **Date Selection** - Analyze specific dates (defaults to event date)
- 📏 **Compact UI** - Maximizes map viewing area with semi-transparent controls

**Preview Card on Dashboard:**
- Shows quick stats when data is available
- Links to full-screen timeline playback
- Event-specific (only shows data for event date)

**Technical Details:**
- Uses `leaflet.heat` plugin for smooth visualization
- Queries PostHog for movement data during event window (30min before to 4hr after event start)
- Groups by person_id and 5-minute time buckets for efficient aggregation
- Database-level aggregation with LIMIT 10000 for performance
- Timezone-aware: converts local event time (GMT+2) to UTC for accurate PostHog queries
- API endpoint: `/api/analytics/movement-timeline?date=YYYY-MM-DD`
- Slider control for scrubbing through timeline
- Auto-stops at end of timeline

---

## Event Tracking

### Automatic Events (Built-in by PostHog)
- `$pageview` - Page views
- `$pageleave` - Page exits
- Session starts/ends
- Device and browser info
- Geographic location (if enabled)

### Custom Events

**Map Interactions:**
- `map_marker_clicked` - User clicked a location marker
  - Properties: location_id, location_type, has_candy, is_start, address, user_lat, user_lng
- `map_directions_requested` - User requested walking directions
  - Properties: from_lat, from_lng, to_lat, to_lng
- `map_center_on_user` - User clicked "Center on me" button
  - Properties: user_lat, user_lng
- `map_cluster_clicked` - User clicked a marker cluster
  - Properties: cluster_size, user_lat, user_lng
- `map_user_location_enabled` - GPS permission status (filtered from analytics)
  - Properties: granted (boolean), accuracy (if granted), error_code (if denied)
  - **Note:** This event is excluded from Event Breakdown, Recent Activity, and Engagement metrics to prevent skewing numbers

**Location List Interactions:**
- `location_sorted` - User changed sort order
  - Properties: sort_by (distance/address/none)
- `location_filter_applied` - User applied a filter
  - Properties: filter_type, filter_value
- `location_filters_cleared` - User cleared all filters
  - Properties: filters_cleared (count)
- `location_card_clicked` - User clicked "View on Map" from list
  - Properties: location_id, location_type, has_candy, address

**Admin Actions (Admin Users Only):**
- `location_created` - New location added
  - Properties: location_type
- `location_updated` - Location edited
  - Properties: location_id, location_type
- `location_deleted` - Location removed
  - Properties: location_id, location_type, address
- `bulk_action` - Bulk operations performed
  - Properties: action_type (reset_candy/export_csv/export_json), count

---

## Multi-Neighborhood Architecture

### Single PostHog Project Approach

**How It Works:**
1. Both neighborhoods (Uitzicht & Sandown) use the **same PostHog project**
2. Every event automatically includes a `neighborhood` property (set from `NEXT_PUBLIC_NEIGHBORHOOD_NAME`)
3. All HogQL queries filter by this property
4. Each admin dashboard shows only their neighborhood's data

**Why This Works:**
- ✅ **No credit card needed** - Free tier supports 1 project
- ✅ **Automatic filtering** - Queries include `WHERE properties.neighborhood = 'X'`
- ✅ **Data isolation** - Admins see only their deployment's metrics
- ✅ **Easy setup** - Single set of credentials for both deployments
- ✅ **Cost effective** - 1M events/month shared (plenty for 2 neighborhoods)

**Example:**
```typescript
// Automatically registered on every event:
{
  neighborhood: "Uitzicht",  // or "Sandown"
  event_year: "2025",
  deployment_url: "https://uitzicht.trueburn.co.za"
}
```

---

## Setup Instructions

### 1. Create PostHog Account (Free Tier)

1. Sign up at https://posthog.com (free - no credit card required)
2. Create a new project
3. Copy your credentials:
   - **Project API Key** → `NEXT_PUBLIC_POSTHOG_KEY`
   - **Project ID** (from Settings) → `POSTHOG_PROJECT_ID`
   - **Personal API Key** (create with "Query Read" permission) → `POSTHOG_PERSONAL_API_KEY`

### 2. Add Environment Variables

Add to **both** Vercel deployments (Uitzicht AND Sandown):

```env
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com
POSTHOG_PERSONAL_API_KEY=phx_xxxxx
POSTHOG_PROJECT_ID=12345
```

**Important:** Use the **SAME** credentials for both deployments.

### 3. Deploy & Verify

1. Deploy to Vercel
2. Visit `/admin` on both deployments
3. Navigate around the public site to generate events
4. Check PostHog dashboard to see events coming in
5. Verify `neighborhood` property is set correctly on all events

### 4. Optional: Create Custom Dashboard in PostHog

You can create additional dashboards in PostHog with filters:
- Dashboard 1: Filter by `neighborhood = "Uitzicht"`
- Dashboard 2: Filter by `neighborhood = "Sandown"`
- Dashboard 3: Combined view (no filter)

---

## API Endpoints

All endpoints require authentication (admin users only).

### `GET /api/analytics/live`

Get active users in the last 5 minutes.

**Response:**
```json
{
  "active_users": 3,
  "time_window_minutes": 5,
  "neighborhood": "Uitzicht"
}
```

### `GET /api/analytics/today`

Get daily statistics.

**Response:**
```json
{
  "total_visitors": 42,
  "total_sessions": 38,
  "avg_session_duration_seconds": 145,
  "device_breakdown": [
    { "device_type": "Mobile", "users": 28 },
    { "device_type": "Desktop", "users": 14 }
  ],
  "neighborhood": "Uitzicht"
}
```

### `GET /api/analytics/popular-locations?limit=10`

Get most clicked locations today.

**Response:**
```json
{
  "locations": [
    {
      "address": "123 Main St",
      "location_type": "House",
      "has_candy": true,
      "clicks": 15
    }
  ],
  "neighborhood": "Uitzicht"
}
```

---

## Components

### Client Components

**`src/providers/PostHogProvider.tsx`**
- Wraps app to initialize PostHog
- Tracks pageviews on route changes
- Exports `usePostHog()` hook for event tracking

**`src/components/admin/analytics/AnalyticsDashboard.tsx`**
- Main analytics dashboard container
- Collapsible section with live indicator

**`src/components/admin/analytics/LiveUsersCard.tsx`**
- Real-time active users widget
- 30-second auto-refresh

**`src/components/admin/analytics/StatsGrid.tsx`**
- Daily statistics cards
- Device breakdown visualization

**`src/components/admin/analytics/PopularLocations.tsx`**
- Top 10 locations list
- Ranked with view counts

### Server Components

**`src/lib/posthog/client.ts`**
- Browser PostHog initialization
- Auto-registers neighborhood property

**`src/lib/posthog/server.ts`**
- PostHog Node SDK wrapper
- Query API helper with caching

**`src/lib/posthog/queries.ts`**
- HogQL query templates
- All queries auto-filtered by neighborhood

**`src/app/api/analytics/*/route.ts`**
- Protected API endpoints for analytics data
- 30-second cache on responses

---

## Privacy & GDPR Considerations

### Data Collected

**Automatically by PostHog:**
- Anonymous visitor ID (cookie-based)
- Page views and navigation
- Device type, browser, screen size
- Approximate location (IP-based)

**Custom Events:**
- User interactions (clicks, filters, sorts)
- Admin actions (CRUD operations)
- NO personally identifiable information (PII)
- NO user names, emails, or phone numbers

### Privacy Controls

**What We DON'T Track:**
- User names or emails
- Exact GPS coordinates of users
- Payment information
- Personal messages

**GDPR Compliance:**
- PostHog free tier includes EU hosting option
- Data retention: 7 days (free tier) or configurable
- Users can opt-out via browser "Do Not Track" settings
- No tracking of authenticated user emails (only anonymous IDs)

**Recommended:**
- Add privacy policy link to footer
- Mention analytics in terms of service
- Provide opt-out mechanism if required by your jurisdiction

---

## Performance Impact

**Minimal Impact:**
- ✅ PostHog loads asynchronously (no blocking)
- ✅ Events batched and sent in background
- ✅ API responses cached (30 seconds)
- ✅ Dashboard auto-refresh intervals optimized (30-60s)

**Bundle Size:**
- `posthog-js`: ~40KB gzipped
- `posthog-node`: Server-only (no client impact)

**Network:**
- Event tracking: ~1-2 KB per event
- Analytics API: ~2-5 KB per response (cached)

---

## Troubleshooting

### Using the Built-in Diagnostics Tool

The easiest way to troubleshoot PostHog configuration issues is to use the built-in diagnostics panel:

1. Navigate to `/admin` in your browser
2. Expand the "Live Analytics" section
3. Click "Run Diagnostics" in the "PostHog Configuration Diagnostics" panel
4. Review the results:
   - ✅ Green checkmarks = Configured correctly
   - ❌ Red alerts = Missing or incorrect configuration
   - ⚠️ Warnings = Potential issues (wrong key format, etc.)
5. Follow the recommendations provided

The diagnostics tool will:
- Check all environment variables are set
- Verify API key formats (phc_ for Project Key, phx_ for Personal Key)
- Test the PostHog API connection
- Provide specific recommendations for fixing issues

### Events Not Appearing

**Check:**
1. Environment variables set correctly in Vercel
2. PostHog project key is correct (starts with `phc_`)
3. `neighborhood` property is set (check PostHog Live Events view)
4. Browser console for PostHog errors

**Solution:**
```bash
# Local testing
console.log(process.env.NEXT_PUBLIC_POSTHOG_KEY) // Should output your key
```

### Dashboard Shows No Data

**Check:**
1. PostHog Personal API Key has "Query Read" permission
2. Personal API Key starts with `phx_` (not `phc_`)
3. Project ID is correct (numeric ID, not project slug)
4. Admin is authenticated
5. Browser console for API errors

**Solution:**
Use the diagnostics tool at `/admin` or test the API endpoint directly:
```bash
# Test API endpoints directly
curl https://your-domain.com/api/analytics/live \
  -H "Cookie: your-auth-cookie"
```

### Wrong Neighborhood Data

**Check:**
1. `NEXT_PUBLIC_NEIGHBORHOOD_NAME` is set correctly in Vercel
2. Both deployments have different values for this variable

**Solution:**
```bash
# Verify in PostHog Live Events
# Filter by: properties.neighborhood = "Your Name"
```

### Rate Limiting

PostHog free tier limits:
- 240 requests/minute
- 1200 requests/hour

**Solution:**
- Increase auto-refresh intervals
- Reduce number of dashboard components
- Upgrade to paid tier if needed

---

## Free Tier Limits

**PostHog Free Tier (No Credit Card):**
- ✅ 1 million events/month
- ✅ 1 project (supports both neighborhoods)
- ✅ Session recording (5,000 recordings/month)
- ✅ Unlimited team members
- ✅ 7-day data retention
- ✅ Community support

**Estimated Usage:**
- 2 neighborhoods × 100 visitors/day × 10 events/visitor = **2,000 events/day**
- Monthly: **~60,000 events** (well within free tier)

---

## Advanced Features (Optional)

### Session Recording

PostHog can record actual user sessions (video playback):

**Enable in `src/lib/posthog/client.ts`:**
```typescript
posthog.init(key, {
  // ... existing config
  session_recording: {
    recordCanvas: false, // Don't record canvas (map tiles)
    recordCrossOriginIframes: false,
  },
});
```

**Privacy:** Sensitive data is automatically masked.

### A/B Testing & Feature Flags

PostHog supports feature flags for A/B testing:

```typescript
const posthog = usePostHog();

if (posthog?.isFeatureEnabled('new-map-style')) {
  // Show new map tiles
}
```

### Funnels

Track user journeys in PostHog dashboard:
1. Landing → Map view
2. Map view → Location clicked
3. Location clicked → Directions requested

---

## Files Modified

### New Files (13)
- `src/lib/posthog/client.ts`
- `src/lib/posthog/server.ts`
- `src/lib/posthog/queries.ts`
- `src/providers/PostHogProvider.tsx`
- `src/app/api/analytics/live/route.ts`
- `src/app/api/analytics/today/route.ts`
- `src/app/api/analytics/popular-locations/route.ts`
- `src/app/api/analytics/diagnose/route.ts` - **NEW: Diagnostics tool**
- `src/components/admin/analytics/AnalyticsDashboard.tsx`
- `src/components/admin/analytics/DiagnosticsPanel.tsx` - **NEW: Diagnostics UI**
- `src/components/admin/analytics/LiveUsersCard.tsx`
- `src/components/admin/analytics/StatsGrid.tsx`
- `src/components/admin/analytics/PopularLocations.tsx`

### Modified Files (9)
- `src/app/layout.tsx` - Added PostHogProvider
- `src/app/admin/page.tsx` - Added analytics dashboard
- `src/components/map/MapView.tsx` - Added event tracking
- `src/components/locations/LocationList.tsx` - Added filter/sort tracking
- `src/components/locations/LocationCard.tsx` - Added click tracking
- `src/components/admin/LocationForm.tsx` - Added CRUD tracking
- `src/lib/hooks/useUserLocation.ts` - Added GPS permission tracking
- `.env.example` - Added PostHog variables
- `package.json` - Added posthog-js, posthog-node

---

## Support & Resources

- **PostHog Documentation:** https://posthog.com/docs
- **HogQL Guide:** https://posthog.com/docs/product-analytics/sql
- **Community Forum:** https://posthog.com/questions
- **GitHub Issues:** https://github.com/anthropics/claude-code/issues

---

**Last Updated:** 2025-10-09
**Status:** ✅ Production Ready (Optional Feature)
