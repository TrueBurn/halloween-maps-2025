'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet.markercluster';
import { MapPin, Loader2 } from 'lucide-react';
import { env } from '~/env';
import { useLocations } from '~/lib/hooks/useLocations';
import { useUserLocation } from '~/lib/hooks/useUserLocation';
import { usePostHog } from '~/providers/PostHogProvider';
import { createLocationIcon } from './LocationMarker';
import { UserLocationButton } from './UserLocationButton';
import { calculateDistance, formatDistance } from '~/lib/utils/distance';

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.MarkerClusterGroup | null>(null);
  const userMarker = useRef<L.Marker | null>(null);
  const routingControl = useRef<L.Routing.Control | null>(null);
  const searchParams = useSearchParams();

  const { locations, loading, error } = useLocations();
  const { location: userLocation } = useUserLocation();
  const posthog = usePostHog();

  // Center map on user location
  const centerOnUser = () => {
    if (mapInstance.current && userLocation) {
      posthog?.capture('map_center_on_user', {
        user_lat: userLocation.latitude,
        user_lng: userLocation.longitude,
      });
      mapInstance.current.setView([userLocation.latitude, userLocation.longitude], 17, {
        animate: true,
        duration: 0.5,
      });
    }
  };

  // Show walking directions
  const showDirections = (toLat: number, toLng: number) => {
    if (!mapInstance.current || !userLocation) return;

    // Track directions request
    posthog?.capture('map_directions_requested', {
      from_lat: userLocation.latitude,
      from_lng: userLocation.longitude,
      to_lat: toLat,
      to_lng: toLng,
    });

    // Remove existing routing control if any
    if (routingControl.current) {
      mapInstance.current.removeControl(routingControl.current);
      routingControl.current = null;
    }

    // Create custom start/end markers
    const startIcon = L.divIcon({
      html: '<div style="background: #10b981; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 18px;">🏠</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: 'custom-waypoint-marker',
    });

    const endIcon = L.divIcon({
      html: '<div style="background: #ef4444; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 18px;">📍</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: 'custom-waypoint-marker',
    });

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
      createMarker: function(i: number, waypoint: any, n: number) {
        return L.marker(waypoint.latLng, {
          icon: i === 0 ? startIcon : endIcon,
        });
      },
      addWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
    } as any).addTo(mapInstance.current);
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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Create marker cluster group with custom options
    markersLayer.current = L.markerClusterGroup({
      maxClusterRadius: 15, // Cluster within 20px (less aggressive - only very close markers)
      spiderfyOnMaxZoom: true, // Spider-fy at max zoom
      showCoverageOnHover: false, // Cleaner hover
      zoomToBoundsOnClick: true, // Zoom into cluster on click
      disableClusteringAtZoom: 17, // Stop clustering earlier when zooming in
      // Custom cluster icon with Halloween theme
      iconCreateFunction: function(cluster) {
        const count = cluster.getChildCount();
        let className = 'marker-cluster-small';
        let emoji = '🦇';

        if (count >= 4) {
          className = 'marker-cluster-large';
          emoji = '👻';
        } else if (count === 3) {
          className = 'marker-cluster-medium';
          emoji = '🕷️';
        }

        return L.divIcon({
          html: `<div><span class="cluster-emoji">${emoji}</span><span class="cluster-count">${count}</span></div>`,
          className: `marker-cluster ${className}`,
          iconSize: L.point(48, 48),
        });
      },
    }).addTo(map);

    // Track cluster clicks
    markersLayer.current.on('clusterclick', function(e: any) {
      const cluster = e.layer;
      const childCount = cluster.getChildCount();
      posthog?.capture('map_cluster_clicked', {
        cluster_size: childCount,
        user_lat: userLocation?.latitude,
        user_lng: userLocation?.longitude,
      });
    });

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

      // Create popup with dynamic content that updates when opened
      const popup = L.popup();

      popup.on('add', () => {
        // Track marker click
        posthog?.capture('map_marker_clicked', {
          location_id: location.id,
          location_type: location.location_type,
          has_candy: location.has_candy,
          is_start: location.is_start,
          address: location.address,
          user_lat: userLocation?.latitude,
          user_lng: userLocation?.longitude,
        });

        const distance = userLocation
          ? calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              location.latitude,
              location.longitude
            )
          : null;

        const popupContent = `
          <div class="p-3" style="background: #1a1a1a; color: #f3f4f6; border-radius: 0.5rem; min-width: 200px;">
            <h3 class="font-bold text-base mb-2" style="color: #f3f4f6;">${location.address}</h3>
            ${distance !== null ? `<p class="text-sm mb-1" style="color: #6366f1; font-weight: 500;">📍 ${formatDistance(distance)} away</p>` : ''}
            <p class="text-sm mb-1" style="color: #9ca3af;">${location.location_type}</p>
            ${location.is_start && location.route ? `<p class="text-sm mb-1" style="color: #10b981;">⭐ Starting point for ${location.route}</p>` : ''}
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
                style="background: #6366f1; color: white; font-weight: 500;"
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

        popup.setContent(popupContent);
      });

      marker.bindPopup(popup);
      marker.addTo(markersLayer.current!);
    });

    // Fit bounds if we have locations (only on initial load/location changes)
    // Skip if URL params are present (user wants to view a specific location)
    const hasUrlParams = searchParams.get('lat') && searchParams.get('lng');

    if (locations.length > 0 && !hasUrlParams) {
      const points: [number, number][] = locations.map((loc) => [loc.latitude, loc.longitude]);

      // Include user location in bounds if available and within 5km of locations
      if (userLocation) {
        const maxDistance = Math.max(
          ...locations.map((loc) =>
            calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              loc.latitude,
              loc.longitude
            )
          )
        );

        // Only include if within 5km
        if (maxDistance <= 5000) {
          points.push([userLocation.latitude, userLocation.longitude]);
        }
      }

      const bounds = L.latLngBounds(points);
      mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, loading, searchParams]);

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
        <div
          className="absolute left-4 bg-surface px-3 py-2 rounded-lg shadow-md border border-gray-700 z-[1000]"
          style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-medium text-text-primary">{locations.filter(loc => loc.has_candy).length} locations</span>
          </div>
        </div>
      )}

      {/* Center on user location button */}
      <div
        className="absolute right-4 z-[1000]"
        style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <UserLocationButton onClick={centerOnUser} disabled={!userLocation} />
      </div>
    </div>
  );
}
