'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { createClient } from '~/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const UserLocationHeatmap = dynamic(
  () => import('~/components/admin/analytics/UserLocationHeatmap').then((mod) => ({ default: mod.UserLocationHeatmap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-surface rounded-lg border border-gray-700">
        <div className="text-text-secondary">Loading heatmap...</div>
      </div>
    ),
  }
);

export default function HeatmapPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check current auth session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/admin/login');
      } else {
        setUser(user);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push('/admin/login');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-text-primary flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-gray-700 px-6 py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/analytics"
              className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back to Analytics</span>
            </Link>
            <div className="h-6 w-px bg-gray-700" />
            <h1 className="text-2xl font-bold">User Location Heatmap</h1>
          </div>
          <p className="text-sm text-text-secondary mt-2">
            Real-time visualization of active users with GPS enabled (last 5 minutes)
          </p>
        </div>
      </header>

      {/* Full-screen heatmap */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto">
          <UserLocationHeatmap />
        </div>
      </div>
    </div>
  );
}
