'use client';

import { useEffect } from 'react';
import { Navigation } from '~/components/layout/Navigation';
import { LocationList } from '~/components/locations/LocationList';
import { usePostHog } from '~/providers/PostHogProvider';
import { useUserLocation } from '~/lib/hooks/useUserLocation';

export default function LocationsPage() {
  const posthog = usePostHog();
  const { location: userLocation } = useUserLocation();

  useEffect(() => {
    // Track list view opened
    posthog?.capture('view_mode_opened', {
      mode: 'list',
      user_lat: userLocation?.latitude,
      user_lng: userLocation?.longitude,
    });
  }, [posthog, userLocation]);

  return (
    <div className="flex h-screen-dynamic flex-col">
      <Navigation />

      <main className="flex-1 overflow-y-auto bg-background">
        <LocationList />
      </main>
    </div>
  );
}
