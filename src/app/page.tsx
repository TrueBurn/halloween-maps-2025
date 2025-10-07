'use client';

import dynamic from 'next/dynamic';
import { Navigation } from '~/components/layout/Navigation';

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
  return (
    <div className="flex h-screen-dynamic flex-col bg-background">
      <Navigation />

      <main className="flex-1 w-full bg-background">
        <MapView />
      </main>
    </div>
  );
}
