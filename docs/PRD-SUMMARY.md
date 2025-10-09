# Halloween Maps 2025 - PRD Summary

## Key Design Decisions

### 1. Clean, Modern UI (No Halloween Theme)
- ❌ No dark mode toggle - single clean theme only
- ❌ No Halloween-themed colors (blood-red, pumpkin-orange, etc.)
- ❌ No emoji icons or Font Awesome
- ✅ Modern color palette with Indigo primary (#6366f1)
- ✅ Lucide React icons (clean, consistent SVG icons)
- ✅ Inter or SF Pro Display typography
- ✅ Mobile-first with bottom sheets (using `vaul`)

### 2. Admin Management
- ✅ Admin UI for location management (not Supabase dashboard)
- Admins can add/edit/delete locations via custom admin panel
- Protected route `/admin` with Supabase Auth
- Form includes:
  - Address (text field for display)
  - Latitude/Longitude (number inputs for map positioning)
  - Location type dropdown
  - Route assignment
  - Flags (is_start, has_candy, has_activity)
  - Activity details textarea

### 3. Address vs Coordinates
- **Display**: Show human-readable address in UI
- **Positioning**: Use lat/lng coordinates for map markers
- **No Geocoding API needed**: Admin enters both address AND coordinates manually
- Example:
  ```
  Address: "123 Main Street"
  Latitude: 0.0000000
  Longitude: 0.0000000
  ```

### 4. Technology Stack
- **Starter**: Create T3 App (TypeScript, Next.js 14, Tailwind)
- **Database**: Supabase (separate instance per neighborhood)
- **Deployment**: Vercel (separate project per neighborhood)
- **Icons**: Lucide React
- **Mobile UI**: Vaul (bottom sheets)
- **No Prisma**: Using Supabase client directly
- **No NextAuth**: Using Supabase Auth

---

## Modern UI Components

### Color Palette
```javascript
colors: {
  primary: '#6366f1',      // Indigo
  secondary: '#ec4899',    // Pink
  success: '#10b981',      // Green (has candy)
  error: '#ef4444',        // Red (no candy)
  warning: '#f59e0b',      // Amber (activity)
  gray: { 50-900 },        // Standard grays
  background: '#ffffff',
  surface: '#f9fafb',
}
```

### Navigation Bar
```
┌─────────────────────────────────────┐
│ 🏘️ Neighborhood Name    📍📋🔄ℹ️  │  60px height
└─────────────────────────────────────┘
```
- Clean white background with subtle shadow
- Left: Neighborhood name (bold, indigo)
- Right: Icon buttons (48x48px touch targets)
- Icons: Map view, List view, Refresh, Info

### Map Markers
```
   Primary Marker (Indigo #6366f1, 40x40px)
         ╔═══╗
         ║ 🏠 ║
         ╚═══╝
            │
            ▼

   With Status Badge (14x14px, top-right overlay)
         ╔═══╗🔴  ← Red = No candy
         ║ 🏠 ║
         ╚═══╝
```
- Clean SVG icons from Lucide
- Subtle drop shadow
- Hover: Slight scale increase
- Active: Elevation increase

### Bottom Sheet (Mobile)
```
Map View
┌─────────────────────────┐
│                         │
│      🗺️  MAP VIEW      │
│                         │
│        Markers          │
│                         │
│                         │
└─────────────────────────┘
           ▲
           │
      ╔════════════════╗
      ║ 55 Dundee St   ║  ← Swipe up/down
      ║ 🏠 House       ║
      ║ 📍 250m away   ║
      ║ 🍬 Has candy   ║
      ║ [Get Directions]║
      ╚════════════════╝
```

### Admin Panel UI
```
┌────────────────────────────────┐
│  Admin Dashboard               │
├────────────────────────────────┤
│  📊 Statistics                 │
│  • 45 Total Locations          │
│  • 42 Have Candy               │
│  • 3 Out of Candy              │
├────────────────────────────────┤
│  🔧 Quick Actions              │
│  [Reset All Candy]             │
│  [Export Data]                 │
├────────────────────────────────┤
│  📍 Locations                  │
│  ┌──────────────────────────┐  │
│  │ Address    │ Type │ Edit │  │
│  ├──────────────────────────┤  │
│  │ 55 Dundee  │ 🏠   │ ✏️  │  │
│  │ 12 Naples  │ 🏠   │ ✏️  │  │
│  └──────────────────────────┘  │
│  [+ Add Location]              │
└────────────────────────────────┘
```

---

## Admin Workflows

### Adding a Location
1. Admin logs in at `/admin`
2. Clicks "+ Add Location"
3. Form appears:
   - **Address**: Text input (e.g., "123 Main Street")
   - **Latitude**: Number input (e.g., 0.0000000)
   - **Longitude**: Number input (e.g., 0.0000000)
   - **Type**: Dropdown (House, Table, Car, Store, Parking, Refreshments)
   - **Route**: Dropdown (Over 8, Under 8, Toddlers)
   - **Starting Point**: Checkbox
   - **Has Candy**: Checkbox (default: checked)
   - **Has Activity**: Checkbox
   - **Activity Details**: Textarea (if has_activity checked)
4. Clicks "Save"
5. Location appears on map immediately
6. Real-time update via Supabase Realtime

### How Admin Gets Coordinates
Options to suggest in admin UI:
1. **Click on Map**: "Click the map to set coordinates"
2. **Use Current Location**: "Use my current GPS location"
3. **Manual Entry**: Enter lat/lng directly
4. **Helper Text**: Show link to https://www.latlong.net/ for manual lookup

---

## Implementation Notes

### Admin Panel Routes
```
/admin              → Dashboard (stats, location table)
/admin/login        → Login page
/admin/locations    → Location management
/admin/locations/new → Add location form
/admin/locations/[id] → Edit location form
```

### Supabase RLS for Admin
```sql
-- Admins table
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only admins can write
CREATE POLICY "Admins can manage locations"
  ON locations
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN (SELECT email FROM admins)
    )
  );
```

### Location Form Component
```typescript
interface LocationFormData {
  address: string
  latitude: number
  longitude: number
  location_type: 'House' | 'Table' | 'Car' | 'Store' | 'Parking' | 'Refreshments'
  route?: 'Over 8' | 'Under 8' | 'Toddlers'
  is_start: boolean
  has_candy: boolean
  has_activity: boolean
  activity_details?: string
}
```

---

## Environment Variables Per Deployment

### Neighborhood A Deployment
```env
NEXT_PUBLIC_SUPABASE_URL=https://neighborhood-a.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_NEIGHBORHOOD_NAME=Your Neighborhood
NEXT_PUBLIC_DEFAULT_LAT=0.0000000
NEXT_PUBLIC_DEFAULT_LNG=0.0000000
NEXT_PUBLIC_DEFAULT_ZOOM=15
```

### Neighborhood B Deployment
```env
NEXT_PUBLIC_SUPABASE_URL=https://sisters.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_NEIGHBORHOOD_NAME=Sister's Neighborhood
NEXT_PUBLIC_DEFAULT_LAT=-34.1234
NEXT_PUBLIC_DEFAULT_LNG=18.5678
NEXT_PUBLIC_DEFAULT_ZOOM=15
```

---

## Next Steps

1. ✅ PRD complete
2. Initialize T3 App project
3. Setup Supabase projects (x2)
4. Implement core map view
5. Implement location list view
6. Implement admin panel
7. Implement authentication
8. Testing & deployment

---

## Questions Resolved
✅ **UI Theme**: Clean, modern, single theme (no dark mode)
✅ **Icons**: Lucide React
✅ **Admin Management**: Custom admin UI (not Supabase dashboard)
✅ **Address/Coordinates**: Show address, use lat/lng for positioning
✅ **Tech Stack**: T3 App + Supabase

## Open Questions
❓ Should we add a map click interface for admins to set coordinates?
❓ PWA support for offline mode?
❓ Real-time updates via Supabase Realtime or periodic polling?
❓ Analytics tracking (Vercel Analytics, Plausible, etc.)?
