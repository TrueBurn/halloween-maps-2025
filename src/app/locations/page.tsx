'use client';

import { Navigation } from '~/components/layout/Navigation';
import { LocationList } from '~/components/locations/LocationList';

export default function LocationsPage() {
  return (
    <div className="flex flex-col" style={{ height: '100vh', height: '100dvh' } as React.CSSProperties}>
      <Navigation />

      <main className="flex-1 overflow-y-auto bg-background">
        <LocationList />
      </main>
    </div>
  );
}
