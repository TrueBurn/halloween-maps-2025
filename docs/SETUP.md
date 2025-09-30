# Halloween Maps 2025 - Setup Complete ✅

## What We've Done

### 1. Initialized T3 App ✅
- Created T3 App with TypeScript, Tailwind CSS, tRPC, and App Router
- Skipped Prisma and NextAuth (using Supabase instead)
- Installed all base dependencies

### 2. Installed Additional Dependencies ✅
```json
{
  "@supabase/supabase-js": "Latest",
  "@supabase/ssr": "Latest",
  "leaflet": "Latest",
  "leaflet-routing-machine": "Latest",
  "lucide-react": "Latest",
  "vaul": "Latest",
  "class-variance-authority": "Latest",
  "clsx": "Latest",
  "tailwind-merge": "Latest",
  "@types/leaflet": "Latest (dev)",
  "@types/leaflet-routing-machine": "Latest (dev)"
}
```

### 3. Configured Tailwind with Custom Colors ✅
Updated `src/styles/globals.css` with our custom color palette:
- Primary: Indigo (#6366f1)
- Secondary: Pink (#ec4899)
- Success: Green (#10b981)
- Warning: Amber (#f59e0b)
- Error: Red (#ef4444)

### 4. Set Up Environment Variables ✅
- Updated `.env.example` with Supabase and neighborhood config
- Updated `src/env.js` with validation schema
- Environment variables include:
  - Supabase URL and anon key
  - Neighborhood name, coordinates, zoom level
  - Event date and time

### 5. Created Project Structure ✅
```
src/
├── lib/
│   ├── supabase/
│   │   ├── client.ts      ✅ Browser Supabase client
│   │   └── server.ts      ✅ Server Supabase client
│   ├── hooks/             📁 Ready for custom hooks
│   └── utils/             📁 Ready for utilities
├── types/
│   └── database.types.ts  ✅ Supabase type definitions
├── components/
│   ├── map/               📁 Map components
│   ├── admin/             📁 Admin panel components
│   ├── layout/            📁 Layout components (nav, modals)
│   └── shared/            📁 Shared UI components
└── app/                   📁 Next.js App Router pages
```

---

## Next Steps

### Phase 1: Database Setup
1. Create Supabase project
2. Run SQL migrations to create tables and enums
3. Set up Row Level Security (RLS) policies
4. Generate TypeScript types from schema
5. Update `.env` with actual Supabase credentials

### Phase 2: Core Map View
1. Create map component with Leaflet
2. Implement location markers with Lucide icons
3. Add user location tracking
4. Implement location popups/bottom sheets
5. Add walking directions

### Phase 3: Location List View
1. Create list component
2. Implement filtering and sorting
3. Add distance calculation
4. Link to map view

### Phase 4: Admin Panel
1. Create admin routes (`/admin`, `/admin/login`)
2. Implement Supabase Auth
3. Build location management UI (CRUD)
4. Add coordinate input helpers (click map, GPS)
5. Implement bulk actions (reset candy, export CSV)

### Phase 5: UI Polish
1. Create navigation bar component
2. Build information modal
3. Add loading states
4. Implement error handling
5. Mobile optimization

### Phase 6: Testing & Deployment
1. Test on mobile devices
2. Performance optimization
3. Deploy to Vercel
4. Set up custom domain
5. User acceptance testing

---

## Development Commands

### Run Development Server
```bash
npm run dev
```
Then open [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
npm start
```

### Type Check
```bash
npm run typecheck
```

### Lint
```bash
npm run lint
```

---

## Supabase Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization
4. Enter project name (e.g., "halloween-uitzicht")
5. Generate secure database password
6. Select region (closest to users)
7. Click "Create Project"

### 2. Run Migrations
Navigate to SQL Editor in Supabase dashboard and run:

```sql
-- Create enums
CREATE TYPE location_type AS ENUM ('House', 'Table', 'Car', 'Parking', 'Refreshments');
CREATE TYPE route AS ENUM ('Over 8', 'Under 8', 'Toddlers');

-- Create locations table
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified_at TIMESTAMPTZ,
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  address VARCHAR NOT NULL,
  is_start BOOLEAN NOT NULL DEFAULT false,
  is_participating BOOLEAN NOT NULL DEFAULT true,
  has_candy BOOLEAN NOT NULL DEFAULT true,
  location_type location_type NOT NULL,
  route route,
  phone_number VARCHAR,
  email VARCHAR,
  has_activity BOOLEAN NOT NULL DEFAULT false,
  activity_details TEXT
);

-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Public read access for participating locations
CREATE POLICY "Public locations are viewable"
  ON locations FOR SELECT
  USING (is_participating = true);

-- Authenticated users can insert/update/delete (admin only)
CREATE POLICY "Authenticated users can manage locations"
  ON locations FOR ALL
  USING (auth.role() = 'authenticated');
```

### 3. Get API Keys
1. Go to Project Settings > API
2. Copy the following to your `.env` file:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon/public key)

### 4. Generate TypeScript Types
```bash
npx supabase gen types typescript --project-id [YOUR_PROJECT_ID] > src/types/database.types.ts
```

### 5. Test Connection
Create a test page to verify Supabase connection:
```typescript
import { createClient } from '~/lib/supabase/client'

export default function TestPage() {
  const supabase = createClient()
  // Test query here
}
```

---

## Environment Variables Setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key

# Neighborhood Configuration
NEXT_PUBLIC_NEIGHBORHOOD_NAME=YourNeighborhood
NEXT_PUBLIC_DEFAULT_LAT=-33.8688
NEXT_PUBLIC_DEFAULT_LNG=18.5122
NEXT_PUBLIC_DEFAULT_ZOOM=15

# Event Configuration
NEXT_PUBLIC_EVENT_YEAR=2025
NEXT_PUBLIC_EVENT_DATE=2025-10-31
NEXT_PUBLIC_EVENT_START_TIME=16:00
```

---

## Project Status

- ✅ T3 App initialized
- ✅ Dependencies installed
- ✅ Tailwind configured
- ✅ Environment variables set up
- ✅ Supabase clients created
- ✅ Type definitions created
- ✅ Project structure established
- ⏳ Supabase database (need to create)
- ⏳ Map view components
- ⏳ Admin panel
- ⏳ Authentication
- ⏳ Deployment

---

## Resources

- [T3 Stack Documentation](https://create.t3.gg/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Leaflet Documentation](https://leafletjs.com/)
- [Lucide React Icons](https://lucide.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

---

## Need Help?

Refer to:
- `PRD.md` - Full product requirements
- `PRD-SUMMARY.md` - Quick reference and design mockups
- This file (`SETUP.md`) - Setup instructions and next steps
