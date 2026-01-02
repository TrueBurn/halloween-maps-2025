# MapCN/MapLibre GL Evaluation

> **GitHub Issue:** [#3 - Enhancement: use MapCN](https://github.com/TrueBurn/halloween-maps-2025/issues/3)
> **Evaluation Date:** January 2026
> **Status:** Future Consideration

---

## Executive Summary

**Recommendation: Do NOT migrate at this time.**

The current Leaflet implementation is production-ready, feature-complete, and works well. While MapCN/MapLibre GL offers some advantages (native clustering, React-first design, built-in dark mode), the ~20-30 hour migration effort is not justified for an app that's already working.

**Keep as future consideration** if:
- Performance issues emerge with 1000+ markers
- Major UI redesign is planned
- Significant new feature development requires map changes

---

## What is MapCN?

[MapCN](https://github.com/AnmolSaini16/mapcn) is a React component library for maps, following the shadcn/ui pattern:

- **Built on:** MapLibre GL JS (open-source, WebGL-based)
- **Philosophy:** Copy-paste components, zero config
- **Features:** Theme-aware (dark mode), Tailwind CSS styling
- **Components:** Map, Marker, Popup, Tooltip, Route, Navigation controls

**Related Libraries:**
- [MapLibre GL JS](https://maplibre.org/) - Core mapping engine
- [react-map-gl](https://visgl.github.io/react-map-gl/) - React wrapper (more mature alternative)

---

## Current Implementation Analysis

### Leaflet Stack

| Metric | Value |
|--------|-------|
| Map components | 5 files (~1,200 lines) |
| Dependencies | 4 production + 4 type definitions |
| Custom SVG icons | 25 variants |
| CSS overrides | 60+ selectors for dark theme |
| Plugins used | 3 (routing-machine, markercluster, heat) |

### Files

| File | Lines | Purpose |
|------|-------|---------|
| `src/components/map/MapView.tsx` | ~380 | Main interactive map |
| `src/components/map/LocationMarker.tsx` | ~70 | Icon system |
| `src/components/admin/CoordinatePicker.tsx` | ~150 | Admin coordinate picker |
| `src/components/admin/analytics/UserLocationHeatmap.tsx` | ~340 | User density heatmap |
| `src/components/admin/analytics/TimelineMapPlayback.tsx` | ~330 | Movement timeline |

### Dependencies

```json
{
  "leaflet": "^1.9.4",
  "leaflet-routing-machine": "^3.2.12",
  "leaflet.markercluster": "^1.5.3",
  "leaflet.heat": "^0.2.0"
}
```

---

## Feature Comparison

| Feature | Leaflet (Current) | MapLibre GL | Winner |
|---------|------------------|-------------|--------|
| **Clustering** | Plugin required | Native built-in | MapLibre |
| **Heatmaps** | Plugin required | Native built-in | MapLibre |
| **Routing** | Plugin (OSRM) | Plugin (OSRM) | Tie |
| **Custom icons** | L.icon() | Element markers | Tie |
| **Dark theme** | 60+ CSS overrides | Native theme-aware | MapLibre |
| **React integration** | Manual hooks/effects | Declarative components | MapLibre |
| **Bundle size** | ~140KB | ~732KB | Leaflet |
| **Maturity** | 10+ years | 4 years | Leaflet |
| **Community** | Massive | Growing | Leaflet |
| **3D/Globe** | Not supported | Supported | MapLibre |
| **Vector tiles** | Limited | Native | MapLibre |

### Feature Parity Details

**Clustering:**
- Leaflet: Uses `leaflet.markercluster` plugin with custom Halloween-themed icons
- MapLibre: Native GeoJSON source with `cluster: true`, `clusterRadius`, `clusterMaxZoom`

**Heatmaps:**
- Leaflet: Uses `leaflet.heat` plugin
- MapLibre: Native heatmap layer type with full styling support

**Routing:**
- Leaflet: `leaflet-routing-machine` with OSRM backend
- MapLibre: `@maplibre/maplibre-gl-directions` plugin with OSRM backend

**Custom Icons:**
- Leaflet: `L.icon()` with SVG URLs
- MapLibre: Custom HTML elements or sprite-based icons

---

## Benefits of Migration

1. **Native clustering/heatmaps** - No external plugin dependencies
2. **Cleaner React patterns** - Declarative `<Marker>`, `<Popup>`, `<Layer>` components
3. **Theme-aware** - Dark mode without CSS overrides (currently 60+ rules)
4. **WebGL performance** - Better for large datasets and smooth animations
5. **Supabase integration** - [Official blog post](https://supabase.com/blog/postgres-realtime-location-sharing-with-maplibre) demonstrates MapLibre + Supabase Realtime
6. **Modern ecosystem** - TypeScript-first, active development

---

## Costs of Migration

1. **Development time** - 20-30 hours estimated
2. **Risk** - Introducing bugs in working, production-tested code
3. **Bundle size** - ~5x larger than Leaflet
4. **Learning curve** - Different API paradigm
5. **Testing burden** - All map features need re-verification
6. **Less mature** - Fewer Stack Overflow answers, community examples

---

## ROI Assessment

```
Current state:  Working, production-ready, all features complete
Migration cost: 20-30 hours of development
Benefit:        Marginal (cleaner code, native features)
Risk:           Non-zero (bugs, regressions)

ROI = Benefit / Cost = LOW
```

**Verdict:** Not worth migrating a working app. Consider for v2 or new projects.

---

## Migration Plan (If Needed Later)

### Recommended Approach

Use **react-map-gl** with MapLibre GL backend (more mature than raw MapCN):

```bash
npm install react-map-gl maplibre-gl @maplibre/maplibre-gl-directions
```

### Phases

#### Phase 1: Setup (2 hours)
- Install dependencies
- Configure MapLibre GL in Next.js (CSS imports, SSR handling)
- Create base `<Map>` wrapper component

#### Phase 2: Main MapView (8-12 hours)
- Rewrite MapView.tsx using react-map-gl components
- Convert clustering to GeoJSON source with `cluster: true`
- Migrate custom SVG icons to element markers
- Implement popups with `<Popup>` component
- Replace window-scoped functions with React state

#### Phase 3: Routing (4-6 hours)
- Integrate @maplibre/maplibre-gl-directions
- Configure OSRM backend (same as current)
- Style direction controls for dark theme

#### Phase 4: Admin Components (4-6 hours)
- Rewrite CoordinatePicker with draggable markers
- Migrate UserLocationHeatmap to native heatmap layer
- Migrate TimelineMapPlayback

#### Phase 5: Cleanup (2-4 hours)
- Remove Leaflet dependencies (4 packages)
- Remove CSS overrides (60+ selectors)
- Update tests
- Verify all features on both neighborhoods

**Total Estimate: 20-30 hours**

---

## When to Reconsider

Revisit this decision if:

- **Performance issues** with 500+ simultaneous markers
- **3D terrain or globe view** becomes a requirement
- **Major UI redesign** that requires component rewrites anyway
- **Significant new map features** planned that MapLibre handles better
- **Reducing bundle size** is NOT a priority

---

## Resources

### MapCN/MapLibre GL
- [MapCN GitHub](https://github.com/AnmolSaini16/mapcn)
- [MapCN Demo](https://mapcn.vercel.app)
- [MapLibre GL JS Docs](https://maplibre.org/maplibre-gl-js/docs/)
- [react-map-gl Docs](https://visgl.github.io/react-map-gl/)
- [@maplibre/maplibre-gl-directions](https://github.com/maplibre/maplibre-gl-directions)

### Supabase + MapLibre
- [Postgres Realtime Location Sharing with MapLibre](https://supabase.com/blog/postgres-realtime-location-sharing-with-maplibre)

### Examples
- [MapLibre Clustering Example](https://maplibre.org/maplibre-gl-js/docs/examples/create-and-style-clusters/)
- [MapLibre Heatmap Example](https://maplibre.org/maplibre-gl-js/docs/examples/create-a-heatmap-layer/)
- [MapLibre Custom Markers](https://maplibre.org/maplibre-gl-js/docs/examples/add-custom-icons-with-markers/)

---

**Last Updated:** January 2026
**Decision:** Keep current Leaflet implementation, track MapCN for future consideration
