# Map Tiles Guide

## Current Configuration

The app currently uses **light OpenStreetMap tiles** for better readability of street names and labels.

## Switching Between Light and Dark Map Tiles

### Current (Light Mode)

**File:** `src/components/map/MapView.tsx`

```typescript
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19,
}).addTo(map);
```

**Benefits:**
- Excellent street name readability
- High contrast labels
- Familiar map appearance
- Works well with dark UI elements overlaid

---

## How to Switch to Dark Map Tiles

If you want dark map tiles to match the dark theme UI, follow these steps:

### Step 1: Update MapView.tsx

**File:** `src/components/map/MapView.tsx`

**Replace this:**
```typescript
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19,
}).addTo(map);
```

**With this:**
```typescript
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap contributors, © CARTO',
  maxZoom: 19,
  className: 'map-tiles', // Optional: add this for brightness filter
}).addTo(map);
```

### Step 2: (Optional) Add Brightness Filter for Better Readability

If street names are too hard to read on dark tiles, add this CSS:

**File:** `src/styles/globals.css`

**Add before the Leaflet popup styles:**
```css
/* Map Tiles - Brighten for better readability */
.map-tiles {
  filter: brightness(1.15) contrast(1.05);
}
```

This brightens the dark tiles by 15% and increases contrast by 5%, making street names more readable while maintaining the dark aesthetic.

---

## Alternative Dark Tile Providers

### 1. CARTO Dark (No Labels)
For a cleaner look without street labels:

```typescript
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap contributors, © CARTO',
  maxZoom: 19,
}).addTo(map);
```

### 2. CARTO Dark Matter (Only Labels)
Use as an overlay for custom styling:

```typescript
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap contributors, © CARTO',
  maxZoom: 19,
}).addTo(map);
```

### 3. Stamen Toner (High Contrast)
Black and white high-contrast tiles:

```typescript
L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
  maxZoom: 19,
}).addTo(map);
```

### 4. MapBox Dark (Requires API Key)
Premium dark tiles with excellent styling:

```typescript
// First, get a free API key from https://www.mapbox.com/
const MAPBOX_TOKEN = 'your_mapbox_access_token';

L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`, {
  attribution: '© <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 19,
  tileSize: 512,
  zoomOffset: -1,
}).addTo(map);
```

---

## Comparison: Light vs Dark

### Light Tiles (Current)
✅ **Pros:**
- Excellent readability of street names
- High contrast for all labels
- No additional brightness filter needed
- Familiar map appearance
- Works well with dark UI overlay elements

❌ **Cons:**
- Doesn't fully match dark theme aesthetic
- Bright map on dark UI might feel jarring

### Dark Tiles
✅ **Pros:**
- Matches dark theme aesthetic perfectly
- Immersive Halloween atmosphere
- Location markers pop more against dark background
- Reduced eye strain in low-light environments

❌ **Cons:**
- Street names can be harder to read
- May require brightness filter adjustment
- Less familiar map appearance

---

## Testing Both Options

To help decide which tiles work best, you can temporarily add a tile layer switcher:

```typescript
// After creating the map, add both tile layers
const lightTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19,
});

const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap contributors, © CARTO',
  maxZoom: 19,
});

// Add the default layer
lightTiles.addTo(map);

// Add layer control for switching
const baseMaps = {
  "Light": lightTiles,
  "Dark": darkTiles
};

L.control.layers(baseMaps).addTo(map);
```

This adds a control in the top-right corner to toggle between light and dark tiles.

---

## Recommendations

**For Production:**
- Use **light tiles** if readability and navigation are top priorities
- Use **dark tiles** if aesthetic and theme consistency matter more

**Best of Both Worlds:**
- Keep light tiles as default
- Add a theme toggle that switches both UI and map tiles together
- Store user preference in localStorage

---

## Current Decision

We're using **light OpenStreetMap tiles** because:
1. Street name readability is crucial for navigation
2. High contrast makes the map easier to use
3. Dark UI elements (popups, markers, nav) already provide Halloween atmosphere
4. Users are familiar with this map style

The dark theme UI combined with light map tiles provides the best balance of aesthetics and functionality.
