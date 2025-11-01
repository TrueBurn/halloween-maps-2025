'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Navigation } from '~/components/layout/Navigation';
import { usePostHog } from '~/providers/PostHogProvider';
import { useUserLocation } from '~/lib/hooks/useUserLocation';

const MapView = dynamic(
  () => import('~/components/map/MapView').then((mod) => ({ default: mod.MapView })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="text-text-secondary">Loading map...</div>
      </div>
    ),
  }
);

export default function Home() {
  const posthog = usePostHog();
  const { location: userLocation } = useUserLocation();

  useEffect(() => {
    // Track map view opened
    posthog?.capture('view_mode_opened', {
      mode: 'map',
      user_lat: userLocation?.latitude,
      user_lng: userLocation?.longitude,
    });
  }, [posthog, userLocation]);

  return (
    <div className="flex h-screen-dynamic flex-col bg-background">
      <Navigation />

      <main className="flex-1 w-full bg-background">
        <MapView />
      </main>
    </div>
  );
}
