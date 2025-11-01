import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createClient } from '~/lib/supabase/server';
import { UserLocationHeatmap } from '~/components/admin/analytics/UserLocationHeatmap';

export const metadata = {
  title: 'User Location Heatmap | Admin',
};

export default async function HeatmapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-gray-700 px-6 py-4">
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
      <div className="flex-1 p-6">
        <div className="h-full max-w-7xl mx-auto">
          <UserLocationHeatmap />
        </div>
      </div>
    </div>
  );
}
