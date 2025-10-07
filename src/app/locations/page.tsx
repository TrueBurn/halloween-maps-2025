'use client';

import { Navigation } from '~/components/layout/Navigation';
import { LocationList } from '~/components/locations/LocationList';

export default function LocationsPage() {
  return (
    <div className="flex h-screen-dynamic flex-col">
      <Navigation />

      <main className="flex-1 overflow-y-auto bg-background">
        <LocationList />
      </main>
    </div>
  );
}
