'use client';

import { useEffect } from 'react';
import { Navigation } from '~/components/layout/Navigation';
import { LocationList } from '~/components/locations/LocationList';
import { usePostHog } from '~/providers/PostHogProvider';

export default function LocationsPage() {
  const posthog = usePostHog();

  useEffect(() => {
    // Track list view opened
    posthog?.capture('view_mode_opened', {
      mode: 'list',
    });
  }, [posthog]);

  return (
    <div className="flex h-screen-dynamic flex-col">
      <Navigation />

      <main className="flex-1 overflow-y-auto bg-background">
        <LocationList />
      </main>
    </div>
  );
}
