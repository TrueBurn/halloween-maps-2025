'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { MapPin, Loader2 } from 'lucide-react';
import { env } from '~/env';
import { useLocations } from '~/lib/hooks/useLocations';
import { useUserLocation } from '~/lib/hooks/useUserLocation';
import { createLocationIcon } from './LocationMarker';
import { UserLocationButton } from './UserLocationButton';

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const userMarker = useRef<L.Marker | null>(null);
  const routingControl = useRef<L.Routing.Control | null>(null);
  const searchParams = useSearchParams();

  const { locations, loading, error } = useLocations();
  const { location: userLocation } = useUserLocation();

  // Center map on user location
  const centerOnUser = () => {
    if (mapInstance.current && userLocation) {
      mapInstance.current.setView([userLocation.latitude, userLocation.longitude], 17, {
        animate: true,
        duration: 0.5,
      });
    }
  };

  // Show walking directions
  const showDirections = (toLat: number, toLng: number) => {
    if (!mapInstance.current || !userLocation) return;

    // Remove existing routing control if any
    if (routingControl.current) {
      mapInstance.current.removeControl(routingControl.current);
      routingControl.current = null;
    }

    // Create new routing control
    routingControl.current = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.latitude, userLocation.longitude),
        L.latLng(toLat, toLng),
      ],
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'foot', // Walking directions
      }),
      lineOptions: {
        styles: [{ color: '#6366f1', weight: 4, opacity: 0.7 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0,
      },
      addWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
    }).addTo(mapInstance.current);
  };

  // Clear directions
  const clearDirections = () => {
    if (mapInstance.current && routingControl.current) {
      mapInstance.current.removeControl(routingControl.current);
      routingControl.current = null;
    }
  };

  // Expose functions to window for popup buttons
  useEffect(() => {
    (window as any).showDirections = showDirections;
    (window as any).clearDirections = clearDirections;

    return () => {
      delete (window as any).showDirections;
      delete (window as any).clearDirections;
    };
  }, [userLocation]);

  // Initialize map
  useEffect(() => {
    if (mapInstance.current || !mapContainer.current) return;

    const map = L.map(mapContainer.current, {
      center: [env.NEXT_PUBLIC_DEFAULT_LAT, env.NEXT_PUBLIC_DEFAULT_LNG],
      zoom: env.NEXT_PUBLIC_DEFAULT_ZOOM,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, © CARTO',
      maxZoom: 19,
      className: 'map-tiles',
    }).addTo(map);

    markersLayer.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update location markers
  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current || loading) return;

    markersLayer.current.clearLayers();

    locations.forEach((location) => {
      const marker = L.marker([location.latitude, location.longitude], {
        title: location.address,
        icon: createLocationIcon(location),
      });

      const popupContent = `
        <div class="p-3" style="background: #1a1a1a; color: #f3f4f6; border-radius: 0.5rem; min-width: 200px;">
          <h3 class="font-bold text-base mb-2" style="color: #f3f4f6;">${location.address}</h3>
          <p class="text-sm mb-1" style="color: #9ca3af;">${location.location_type}</p>
          ${location.route ? `<p class="text-sm mb-1" style="color: #9ca3af;">Route: ${location.route}</p>` : ''}
          ${location.is_start ? '<p class="text-sm mb-1" style="color: #10b981;">Starting Point ⭐</p>' : ''}
          ${location.has_candy ?
            '<p class="text-sm mb-1" style="color: #10b981;">Has candy ✓</p>' :
            '<p class="text-sm mb-1" style="color: #ef4444;">No candy</p>'
          }
          ${location.has_activity ?
            `<p class="text-sm mb-2" style="color: #f59e0b;">Activity: ${location.activity_details || 'Yes'}</p>` :
            ''
          }
          <div class="mt-3 flex gap-2">
            <button
              onclick="window.showDirections(${location.latitude}, ${location.longitude})"
              class="flex-1 px-3 py-2 text-sm rounded transition-colors"
              style="background: #6366f1; color: white; font-weight: 500; ${!userLocation ? 'opacity: 0.5; cursor: not-allowed;' : ''}"
              ${!userLocation ? 'disabled' : ''}
            >
              Get Directions
            </button>
            <button
              onclick="window.clearDirections()"
              class="px-3 py-2 text-sm rounded transition-colors"
              style="background: #374151; color: #f3f4f6; font-weight: 500;"
            >
              Clear
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(markersLayer.current!);
    });

    // Fit bounds if we have locations
    if (locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map((loc) => [loc.latitude, loc.longitude])
      );
      mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, loading]);

  // Update user location marker
  useEffect(() => {
    if (!mapInstance.current || !userLocation) return;

    if (userMarker.current) {
      userMarker.current.setLatLng([userLocation.latitude, userLocation.longitude]);
    } else {
      userMarker.current = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: L.divIcon({
          className: 'user-location-marker',
          html: '<div style="background: #6366f1; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(99, 102, 241, 0.5);"></div>',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        }),
      }).addTo(mapInstance.current);

      userMarker.current.bindPopup('You are here');
    }
  }, [userLocation]);

  // Handle URL params to center on specific location
  useEffect(() => {
    if (!mapInstance.current) return;

    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (!isNaN(latitude) && !isNaN(longitude)) {
        mapInstance.current.setView([latitude, longitude], 18, {
          animate: true,
          duration: 0.5,
        });
      }
    }
  }, [searchParams]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-[1000]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-text-secondary">Loading locations...</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-error text-white px-4 py-2 rounded-lg shadow-lg z-[1000]">
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {/* Location count badge */}
      {!loading && locations.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-surface px-3 py-2 rounded-lg shadow-md border border-gray-700 z-[1000]">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-medium text-text-primary">{locations.length} locations</span>
          </div>
        </div>
      )}

      {/* Center on user location button */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <UserLocationButton onClick={centerOnUser} disabled={!userLocation} />
      </div>
    </div>
  );
}
