'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '~/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Tables } from '~/types/database.types';
import { Loader2, LogOut, Plus, RefreshCw, Download } from 'lucide-react';
import { LocationTable } from '~/components/admin/LocationTable';
import { LocationForm } from '~/components/admin/LocationForm';
import { useLocations } from '~/lib/hooks/useLocations';
import { exportToCSV, exportToJSON } from '~/lib/utils/export';

type Location = Tables<'locations'>;

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { locations } = useLocations();

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const handleCreate = () => {
    setEditingLocation(undefined);
    setShowForm(true);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setShowForm(true);
  };

  const handleDelete = async (location: Location) => {
    if (!confirm(`Are you sure you want to delete "${location.address}"?`)) {
      return;
    }

    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', location.id);

    if (error) {
      alert(`Error deleting location: ${error.message}`);
    } else {
      setRefreshKey((k) => k + 1); // Trigger refresh
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingLocation(undefined);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingLocation(undefined);
    setRefreshKey((k) => k + 1); // Trigger refresh
  };

  const handleResetCandy = async () => {
    if (!confirm('Reset ALL locations to have candy available? This cannot be undone.')) {
      return;
    }

    const { error } = await supabase
      .from('locations')
      .update({ has_candy: true })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

    if (error) {
      alert(`Error resetting candy: ${error.message}`);
    } else {
      alert(`Successfully reset candy status for all locations!`);
      setRefreshKey((k) => k + 1);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    if (locations.length === 0) {
      alert('No locations to export');
      return;
    }

    if (format === 'csv') {
      exportToCSV(locations);
    } else {
      exportToJSON(locations);
    }

    setShowExportMenu(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-text-primary">Admin Panel</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-secondary">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-gray-800 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={handleCreate}
            className="bg-surface p-6 rounded-lg shadow-lg border border-gray-800 hover:shadow-xl transition-shadow text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-text-primary">Add Location</h3>
            </div>
            <p className="text-sm text-text-secondary">Create a new trick-or-treat location</p>
          </button>

          <button
            onClick={handleResetCandy}
            className="bg-surface p-6 rounded-lg shadow-lg border border-gray-800 hover:shadow-xl transition-shadow text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-success/20 rounded-lg">
                <RefreshCw className="h-5 w-5 text-success" />
              </div>
              <h3 className="font-semibold text-text-primary">Reset Candy</h3>
            </div>
            <p className="text-sm text-text-secondary">Reset all candy status to available</p>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="w-full bg-surface p-6 rounded-lg shadow-lg border border-gray-800 hover:shadow-xl transition-shadow text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-warning/20 rounded-lg">
                  <Download className="h-5 w-5 text-warning" />
                </div>
                <h3 className="font-semibold text-text-primary">Export Data</h3>
              </div>
              <p className="text-sm text-text-secondary">Download locations as CSV or JSON</p>
            </button>

            {/* Export Menu */}
            {showExportMenu && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-surface rounded-lg shadow-xl border border-gray-800 py-2 z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-gray-800 hover:text-text-primary transition-colors"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-gray-800 hover:text-text-primary transition-colors"
                >
                  Export as JSON
                </button>
              </div>
            )}
          </div>

          <a
            href="/"
            className="bg-surface p-6 rounded-lg shadow-lg border border-gray-800 hover:shadow-xl transition-shadow text-left block"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/20 rounded-lg">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary">View Site</h3>
            </div>
            <p className="text-sm text-text-secondary">Go to public map view</p>
          </a>
        </div>

        {/* Location Management */}
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Location Management</h2>
          <LocationTable
            key={refreshKey}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </main>

      {/* Form Modal */}
      {showForm && (
        <LocationForm
          location={editingLocation}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
