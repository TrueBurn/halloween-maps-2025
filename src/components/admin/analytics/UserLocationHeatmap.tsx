'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { RefreshCw, Users, Loader2 } from 'lucide-react';
import { env } from '~/env';

interface HeatmapLocation {
  lat: number;
  lng: number;
  last_seen: string;
}

interface HeatmapData {
  locations: HeatmapLocation[];
  count: number;
  time_window_minutes: number;
  neighborhood: string;
  last_updated: string;
}

export function UserLocationHeatmap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const heatLayer = useRef<any>(null);

  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch heatmap data
  const fetchHeatmapData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/user-heatmap');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: HeatmapData = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching heatmap data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load heatmap data');
    } finally {
      setLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (mapInstance.current || !mapContainer.current) return;

    const map = L.map(mapContainer.current, {
      center: [env.NEXT_PUBLIC_DEFAULT_LAT, env.NEXT_PUBLIC_DEFAULT_LNG],
      zoom: env.NEXT_PUBLIC_DEFAULT_ZOOM,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update heatmap layer when data changes
  useEffect(() => {
    // Don't do anything if map isn't ready or we don't have data yet
    if (!mapInstance.current || !data) return;

    // Remove existing heat layer
    if (heatLayer.current) {
      try {
        mapInstance.current.removeLayer(heatLayer.current);
      } catch (error) {
        console.warn('[Heatmap] Error removing old layer:', error);
      }
      heatLayer.current = null;
    }

    // Create new heat layer ONLY if we have valid location data
    if (data.locations && data.locations.length > 0) {
      try {
        // Convert to leaflet.heat format: [lat, lng, intensity]
        const heatData = data.locations.map((loc) => [loc.lat, loc.lng, 1.0]);

        console.log('[Heatmap] Creating heat layer with data:', {
          locationCount: data.locations.length,
          heatDataPoints: heatData.length,
          firstPoint: heatData[0],
        });

        // Validate we have valid data
        if (heatData.length === 0) {
          console.warn('[Heatmap] No valid heat data points');
          return;
        }

        // Create heatmap layer with Halloween-themed gradient
        console.log('[Heatmap] Initializing leaflet.heat...');
        heatLayer.current = (L as any).heatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 17,
          minOpacity: 0.5,
          max: 1.0,
          gradient: {
            0.0: '#6366f1',  // Primary (indigo)
            0.5: '#ec4899',  // Secondary (pink)
            1.0: '#f59e0b',  // Warning (orange)
          },
        });

        console.log('[Heatmap] Heat layer created, adding to map...');
        // Add to map - use whenReady to ensure map is fully initialized
        if (heatLayer.current && mapInstance.current) {
          mapInstance.current.whenReady(() => {
            if (heatLayer.current && mapInstance.current) {
              // Invalidate size to ensure proper dimensions
              mapInstance.current.invalidateSize();

              // Add heat layer
              heatLayer.current.addTo(mapInstance.current);
              console.log('[Heatmap] Heat layer added successfully');

              // Fit bounds to show all user locations
              const bounds = L.latLngBounds(data.locations.map((loc) => [loc.lat, loc.lng]));
              mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
            }
          });
        }
      } catch (error) {
        console.error('[Heatmap] Error creating heat layer:', error);
      }
    } else {
      // Reset to default view when no data
      if (mapInstance.current) {
        mapInstance.current.setView(
          [env.NEXT_PUBLIC_DEFAULT_LAT, env.NEXT_PUBLIC_DEFAULT_LNG],
          env.NEXT_PUBLIC_DEFAULT_ZOOM
        );
      }
    }
  }, [data]);

  // Initial data fetch
  useEffect(() => {
    void fetchHeatmapData();
  }, []);

  return (
    <div className="relative h-full w-full bg-surface rounded-lg overflow-hidden border border-gray-700">
      {/* Map container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-[1000]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-text-secondary">Loading heatmap...</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && !loading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-error text-white px-4 py-2 rounded-lg shadow-lg z-[1000] max-w-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Stats and refresh control */}
      {!loading && data && (
        <div className="absolute top-4 left-4 right-4 z-[1000]">
          <div className="bg-surface px-4 py-3 rounded-lg shadow-md border border-gray-700">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {data.count} Active {data.count === 1 ? 'User' : 'Users'}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Last {data.time_window_minutes} minutes
                  </p>
                </div>
              </div>

              <button
                onClick={() => void fetchHeatmapData()}
                className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {data.count === 0 && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-sm text-text-secondary">
                  No active users with GPS enabled in the last {data.time_window_minutes} minutes.
                </p>
                <p className="text-xs text-text-secondary mt-2">
                  Users must open the map with location permissions enabled for their location to appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No data state - show when not loading and no data fetched yet */}
      {!loading && !data && (
        <div className="absolute inset-0 flex items-center justify-center z-[1000] bg-background/50">
          <div className="bg-surface px-6 py-4 rounded-lg shadow-md border border-gray-700 max-w-md text-center">
            <Users className="h-12 w-12 text-text-secondary mx-auto mb-3" />
            <p className="text-sm text-text-secondary mb-4">
              Click refresh to load user location data
            </p>
            <button
              onClick={() => void fetchHeatmapData()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Load Heatmap Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
