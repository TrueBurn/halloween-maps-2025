# Halloween Maps 2025 - Product Requirements Document

## Project Overview

Halloween Maps is a mobile-first interactive mapping application designed to help neighborhoods organize and navigate Halloween trick-or-treating events. The application displays participating houses, candy distribution tables, parking areas, and refreshment stations on an interactive map with real-time status updates.

### Version 2025 Goals
- Migrate from vanilla JavaScript to Next.js 14 with App Router
- Support multiple neighborhood deployments via separate Vercel instances
- Mobile-only responsive design
- Admin-controlled location management
- Environment variable-based configuration per deployment

---

## Technical Stack

### Project Foundation
- **Starter**: [Create T3 App](https://create.t3.gg/) - Typesafe Next.js starter
- **Core Stack from T3**:
  - Next.js 14 (App Router)
  - TypeScript (strict mode)
  - Tailwind CSS
  - tRPC (optional - for any custom API routes beyond Supabase)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS (from T3)
- **Map Library**: Leaflet.js with OpenStreetMap tiles
- **Routing**: Leaflet Routing Machine (OSRM for walking directions)
- **Icons**: Font Awesome
- **State Management**: TanStack Query (React Query)

### Backend
- **Database**: Supabase (PostgreSQL) - *replaces Prisma from T3*
- **Authentication**: Supabase Auth (Phone OTP / Email Magic Link) - *replaces NextAuth.js from T3*
- **Real-time**: Supabase Realtime subscriptions
- **API**: Direct Supabase client calls + tRPC for custom logic (if needed)

### Deployment
- **Hosting**: Vercel
- **Architecture**: Separate Vercel projects per neighborhood, each with its own Supabase database
- **Domains**: Custom domains per neighborhood

### T3 Stack Modifications
- ✅ **Keep**: Next.js, TypeScript, Tailwind CSS, tRPC (optional)
- ❌ **Skip**: Prisma (using Supabase client instead)
- ❌ **Skip**: NextAuth.js (using Supabase Auth instead)

---

## Architecture

### Multi-Instance Strategy

Each neighborhood gets:
1. **Separate Vercel Project** (e.g., `uitzicht-halloween`, `sisters-halloween`)
2. **Separate Supabase Project** with isolated database
3. **Custom Domain** (e.g., `uitzicht-halloween.example.com`, `sisters-halloween.example.com`)
4. **Environment Variables** for configuration

### Configuration via Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Neighborhood Configuration
NEXT_PUBLIC_NEIGHBORHOOD_NAME=Your Neighborhood Name
NEXT_PUBLIC_DEFAULT_LAT=0.0000000
NEXT_PUBLIC_DEFAULT_LNG=0.0000000
NEXT_PUBLIC_DEFAULT_ZOOM=15

# Event Configuration
NEXT_PUBLIC_EVENT_YEAR=2025
NEXT_PUBLIC_EVENT_DATE=2025-10-31
NEXT_PUBLIC_EVENT_START_TIME=16:00

# Admin Configuration
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
NEXT_PUBLIC_ADMIN_PHONE=+27123456789

# Optional: Custom Branding
NEXT_PUBLIC_PRIMARY_COLOR=#ff6600
NEXT_PUBLIC_LOGO_URL=/assets/logo.png
```

---

## Database Schema

### Tables

#### `locations`
```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified_at TIMESTAMPTZ,
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  address VARCHAR NOT NULL,
  is_start BOOLEAN NOT NULL DEFAULT false,
  is_participating BOOLEAN NOT NULL DEFAULT true,
  has_candy BOOLEAN NOT NULL DEFAULT true,
  location_type location_type_enum NOT NULL,
  route route_enum,
  phone_number VARCHAR,
  email VARCHAR,
  has_activity BOOLEAN DEFAULT false,
  activity_details VARCHAR
);

-- Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Public read access (anon users only see participating locations)
CREATE POLICY "Public can view participating locations"
  ON locations FOR SELECT
  TO anon
  USING (is_participating = true);

-- Authenticated users can view all locations (enables admin updates)
CREATE POLICY "Authenticated users can view all locations"
  ON locations FOR SELECT
  TO authenticated
  USING (true);

-- Admin can manage all locations
CREATE POLICY "Authenticated users can insert locations"
  ON locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update locations"
  ON locations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete locations"
  ON locations FOR DELETE
  TO authenticated
  USING (true);
```

#### Custom Enums
```sql
CREATE TYPE location_type_enum AS ENUM ('House', 'Table', 'Car', 'Store', 'Parking', 'Refreshments', 'AnimalCharity');
CREATE TYPE route_enum AS ENUM ('Over 8', 'Under 8', 'Toddlers');  -- Age groups for starting points
```

**Note on Routes**: The `route` field represents age groups and is **only assigned to starting points** (`is_start = true`). Regular participating locations do not have routes assigned. Each age group (Over 8, Under 8, Toddlers) has their own designated starting point.

---

## Features

### 1. Interactive Map View

**Core Functionality:**
- Display all participating locations with custom icons
- Real-time location tracking (user position)
- Real-time location tracking (user position)
- Clean, light OpenStreetMap tiles (single theme)
- Marker clustering for dense areas (optional)

**Map Controls:**
- Center on user location button
- Zoom controls (disabled on mobile)
- Walking directions to any location

**Location Types & Icons:**
- 🏠 House: Participating residence (62x62px)
- 🍬 Table: Outdoor candy distribution (50x50px)
- 🚗 Car: Mobile distribution point (50x50px)
- 🏪 Store: Store giving out candy (50x50px)
- 🅿️ Parking: Designated parking area (50x50px)
- ☕ Refreshments: Food and drink station (58x58px)
- ❤️ AnimalCharity: Animal shelter donation station (40x40px)

### 2. Location List View

**Features:**
- Sortable/filterable list of all locations
- Filter by:
  - Location type
  - Age group (for finding starting points: Over 8, Under 8, Toddlers)
  - Has candy status
  - Has activity
  - "Show Only Starting Points" toggle
- Sort by:
  - Distance from user
  - Address
  - Location type

**Display Information:**
- Address
- Location type
- Distance from user (if location available)
- Age group (for starting points only)
- Candy availability
- Activity indicator

### 3. Location Popups

**Information Displayed:**
- Address (heading)
- Location type with icon
- Distance from user
- Age group indicator (e.g., "Starting point for Over 8" - only shown for starting points)
- Candy status (Has candy / No candy)
- Activity details (if applicable)
- "Get Directions" button
- "Configure" icon (only if admin)

### 4. Admin Authentication & Configuration

**Authentication Flow:**
1. Admin clicks "Configure" on a location popup
2. Redirected to configuration page with `locationId` parameter
3. Enter last 4 digits of registered phone number
4. Receive SMS OTP (or email magic link as fallback)
5. Enter 6-digit OTP
6. Access configuration panel

**Configuration Options:**
- Toggle "Has Candy" status
- Update activity details (future enhancement)
- Logout button

**Security:**
- OTP cooldown: 60 seconds between requests
- Session persistence across page visits
- Auto-check for authenticated session on page focus
- RLS policies enforce user can only update their own location

### 5. Information Modal

**Displays on First Visit:**
- Event details (date, start time)
- Starting points for different age groups
- Parking instructions
- Important rules (bands, behavior expectations)
- Map icon legend
- Activities and special locations

**Design:**
- Clean modal with backdrop blur
- Rounded corners, subtle shadow
- Clear typography hierarchy
- Icon legend with actual map markers shown
- Smooth slide-up animation on mobile

**Accessibility:**
- Show/hide via info icon in navigation
- LocalStorage to track if shown
- Close via X button, outside click, or ESC key
- Focus trap when open
- ARIA labels for screen readers

### 6. Visual Design

**Design Philosophy:**
- Clean, modern, minimalist UI
- Single theme (no dark mode toggle)
- Focus on usability and readability
- Halloween context without being overly themed
- Mobile-first responsive design

**Color Palette** (Modern & Clean):
```javascript
colors: {
  primary: '#6366f1',      // Indigo - Primary actions
  secondary: '#ec4899',    // Pink - Accents
  success: '#10b981',      // Green - Positive status (has candy)
  warning: '#f59e0b',      // Amber - Warnings
  error: '#ef4444',        // Red - Negative status (no candy)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  background: '#ffffff',
  surface: '#f9fafb',
  text: {
    primary: '#111827',
    secondary: '#6b7280',
  }
}
```

**Typography:**
- **Headings**: Inter or SF Pro Display (clean, modern)
- **Body**: Inter or System Font Stack
- **No custom Halloween fonts** - keep it professional and readable

### 7. Real-time Updates

**Live Data:**
- Real-time subscription to location changes
- Auto-update markers when candy status changes
- Auto-update popups if currently viewing affected location
- Toast notifications for significant updates (optional)

---

## User Flows

### Primary User Flow (Trick-or-Treater)
1. Open map URL for their neighborhood
2. See clean information modal on first visit
3. Allow location access for GPS tracking
4. View map with all participating locations
5. Tap markers to see details in bottom sheet (mobile) or popup (desktop)
6. Request walking directions to locations
7. Toggle between map and list views
8. View real-time candy availability updates

### Admin Flow
1. Navigate to `/admin/login`
2. Enter email and password
3. Authenticate via Supabase Auth
4. Redirected to admin dashboard
5. View statistics and location table
6. Click "+ Add Location" to create new location:
   - Enter address (e.g., "55 Dundee Street")
   - Set coordinates (click map, use GPS, or manual entry)
   - Select location type, route, and flags
   - Add activity details if applicable
   - Click "Save"
7. Edit existing location:
   - Click edit icon in location table
   - Update fields as needed
   - Save changes
8. Quick actions:
   - Reset all candy status to "Has Candy"
   - Export location data to CSV
9. Updates reflected immediately on public map via real-time subscriptions

---

## Mobile-First Design Requirements

### Responsive Design
- **Target**: Mobile devices only (320px - 428px width)
- **Viewport**: `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`
- **Touch Optimizations**:
  - Large tap targets (minimum 44x44px)
  - Touch-friendly controls
  - Disable pinch zoom on map
  - Smooth scroll behavior

### Performance
- Lazy load images
- Code splitting per route
- Optimize bundle size
- Service Worker for offline capability (optional)
- Image optimization via Next.js Image component

### Navigation
- Sticky header (48px height)
- Bottom-right floating action button (center on user)
- Navigation icons: List view, Refresh, Dark mode, Info

---

## Security Requirements

### Authentication
- Phone OTP via Supabase Auth (SMS)
- Email magic link fallback
- 60-second cooldown between OTP requests
- Session persistence with secure cookies
- Auto-logout after 7 days

### Authorization
- Row Level Security (RLS) on all tables
- Public read access for participating locations
- Authenticated users can only update their own location
- Admin verification via phone/email match

### Data Protection
- Environment variables for sensitive config
- No hardcoded credentials
- HTTPS only
- CORS restrictions
- Rate limiting on auth endpoints

---

## Configuration Management

### Per-Instance Setup

**Step 1: Create Supabase Project**
1. Create new Supabase project for neighborhood
2. Run migration scripts to create tables
3. Enable RLS policies
4. Configure auth providers (phone/email)
5. Copy project URL and anon key

**Step 2: Deploy to Vercel**
1. Create new Vercel project
2. Connect to GitHub repo
3. Set environment variables
4. Deploy
5. Configure custom domain

**Step 3: Populate Initial Data**
1. Create admin seed script or UI
2. Populate locations table with addresses
3. Geocode addresses to lat/lng
4. Assign location types and routes
5. Add phone numbers for homeowners

---

## Data Lifecycle

### Annual Reset Strategy

**Pre-Season (August/September):**
1. Clone previous year's project (optional)
2. Create new Supabase database
3. Update environment variables (EVENT_YEAR, EVENT_DATE)
4. Clear/archive old location data
5. Re-deploy to Vercel

**During Season (October):**
- Normal operations
- Admin updates in real-time
- Monitor and fix issues

**Post-Season (November):**
- Export data for records
- Archive project
- Document learnings for next year

---

## Future Enhancements (Out of Scope for 2025)

- PWA support with offline mode
- Push notifications for updates
- QR code generation for homeowners
- Heat map of popular locations
- Photo uploads at locations
- Gamification (badges, leaderboards)
- Route optimization suggestions
- Analytics dashboard for admins
- Multi-language support
- Accessibility improvements (screen reader, high contrast)

---

## Success Metrics

- **Performance**: < 3s initial load time on 3G
- **Uptime**: 99.9% during event hours
- **Mobile Coverage**: 100% of features work on iOS/Android
- **User Satisfaction**: Positive feedback from participants
- **Admin Adoption**: 80%+ homeowners update candy status

---

## Deployment Checklist

### Pre-Launch
- [ ] Database migrations complete
- [ ] RLS policies tested
- [ ] Environment variables configured
- [ ] Custom domain setup
- [ ] SSL certificate active
- [ ] Test authentication flow
- [ ] Test location updates
- [ ] Test real-time subscriptions
- [ ] Mobile device testing (iOS/Android)
- [ ] Dark mode testing

### Launch Day
- [ ] Monitor error logs
- [ ] Monitor database performance
- [ ] Monitor authentication rate limits
- [ ] Share URL with community
- [ ] Have admin support available

### Post-Launch
- [ ] Gather feedback
- [ ] Fix critical bugs
- [ ] Document issues for next year
- [ ] Export data for archival

---

## Questions & Decisions Needed

### Answered:
✅ Multi-instance architecture: Separate databases per neighborhood
✅ Configuration: Environment variables
✅ Authentication: Admin only (one per neighborhood)
✅ Data lifecycle: Reset each year
✅ Discovery: Custom domains, manual sharing

### Answered Questions:
✅ **UI Theme**: Clean, modern, single theme (no dark mode)
✅ **Icons**: Lucide React (replacing Font Awesome)
✅ **Admin Management**: Custom admin UI for location management
✅ **Address/Coordinates**: Display address (text), use lat/lng for map positioning (no geocoding API needed)
✅ **Tech Stack**: T3 App + Supabase
✅ **Color Palette**: Modern indigo/pink/green (no Halloween theme)

### Open Questions:
1. **Map Click for Coordinates**: Should admin UI allow clicking map to set coordinates?
2. **Real-time Updates**: Supabase Realtime subscriptions or periodic polling?
3. **PWA**: Make it installable on home screen?
4. **Offline Mode**: Cache map tiles for offline use?
5. **Analytics**: Track usage metrics (Vercel Analytics, Plausible)?
6. **Error Tracking**: Implement Sentry or similar?
7. **Coordinate Helper**: Provide lat/lng lookup tool in admin UI?

---

## Technical Considerations

### Next.js App Structure
```
/app
  /layout.tsx (root layout with theme provider)
  /page.tsx (map view)
  /locations/page.tsx (list view)
  /config/page.tsx (admin configuration)
/components
  /Map
  /LocationMarker
  /LocationPopup
  /LocationList
  /InfoModal
  /ThemeToggle
  /Navigation
/lib
  /supabase (client initialization)
  /hooks (useLocations, useAuth, useTheme)
  /types (TypeScript interfaces)
/utils
  /distance-calculator
  /geocoding
/public
  /assets (icons, images)
```

### State Management
- **Server State**: React Query (TanStack Query) for Supabase data
- **Client State**: React Context for theme, auth session
- **URL State**: Next.js searchParams for filters/sorting
- **Persistent State**: localStorage + cookies for preferences

---

## Appendix

### Reference Implementation
Previous version: `/mnt/c/code/TrueBurn/halloween-maps` (vanilla JS)

### Key Files Reviewed
- `src/main.js` - Core map logic
- `src/index.html` - Map view UI
- `src/config.js` - Authentication & configuration
- `src/locations.html` - List view
- `README.md` - Database schema

### Project Initialization
```bash
# Create T3 App with selected options
pnpm create t3-app@latest

# Options to select:
# ✅ TypeScript
# ✅ Tailwind CSS
# ✅ tRPC (optional, for custom API logic)
# ❌ Prisma (skip - using Supabase)
# ❌ NextAuth.js (skip - using Supabase Auth)
# ✅ App Router
```

### Dependencies
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0",
    "@tanstack/react-query": "^5.0.0",
    "@trpc/client": "^11.0.0",
    "@trpc/server": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "leaflet": "^1.9.4",
    "leaflet-routing-machine": "^3.2.12",
    "tailwindcss": "^3.4.0",
    "zod": "^3.23.0",
    "lucide-react": "^0.400.0",
    "vaul": "^0.9.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/react": "^18.3.0",
    "@types/leaflet": "^1.9.0",
    "prettier": "^3.3.0",
    "prettier-plugin-tailwindcss": "^0.6.0"
  }
}
```

**New Dependencies:**
- `lucide-react`: Modern, clean icon library (replaces Font Awesome)
- `vaul`: Bottom sheet component for mobile-first interactions
- `class-variance-authority`, `clsx`, `tailwind-merge`: Better Tailwind utilities

### Why T3 Stack?
- **Type Safety**: End-to-end TypeScript with strict mode
- **Developer Experience**: Pre-configured tooling, ESLint, Prettier
- **Best Practices**: Opinionated structure following Next.js conventions
- **Modularity**: Easy to swap Prisma for Supabase, NextAuth for Supabase Auth
- **Performance**: Optimized bundle, code splitting, image optimization
- **Community**: Well-documented, active community, proven in production

### Supabase Integration with T3

**Client Setup** (`src/lib/supabase/client.ts`):
```typescript
import { createBrowserClient } from '@supabase/ssr'
import { env } from '~/env'

export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
```

**Server Setup** (`src/lib/supabase/server.ts`):
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '~/env'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

**Type Generation**:
```bash
# Generate TypeScript types from Supabase schema
npx supabase gen types typescript --project-id [PROJECT_ID] > src/types/supabase.ts
```
