'use client';

import { useState } from 'react';
import { api } from '~/trpc/react';
import { RefreshCw, Plus, Trash2, BarChart3 } from 'lucide-react';

export default function DevPage() {
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const statsQuery = api.dev.getStats.useQuery(undefined, {
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const seedMutation = api.dev.seedLocations.useMutation({
    onSuccess: (data) => {
      setMessage(data.message);
      setMessageType('success');
      statsQuery.refetch();
    },
    onError: (error) => {
      setMessage(`Error: ${error.message}`);
      setMessageType('error');
    },
  });

  const clearMutation = api.dev.clearExampleLocations.useMutation({
    onSuccess: (data) => {
      setMessage(data.message);
      setMessageType('success');
      statsQuery.refetch();
    },
    onError: (error) => {
      setMessage(`Error: ${error.message}`);
      setMessageType('error');
    },
  });

  const handleSeed = () => {
    setMessage('');
    seedMutation.mutate();
  };

  const handleClear = () => {
    setMessage('');
    if (confirm('Are you sure you want to clear all example locations?')) {
      clearMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Development Tools</h1>
          <p className="mt-2 text-gray-600">
            Manage example locations for testing (dev mode only)
          </p>
        </div>

        {/* Stats Card */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Database Statistics</h2>
            <button
              onClick={() => statsQuery.refetch()}
              disabled={statsQuery.isRefetching}
              className="ml-auto text-gray-500 hover:text-primary transition-colors"
            >
              <RefreshCw
                className={`h-4 w-4 ${statsQuery.isRefetching ? 'animate-spin' : ''}`}
              />
            </button>
          </div>

          {statsQuery.isLoading ? (
            <div className="text-gray-500">Loading stats...</div>
          ) : statsQuery.error ? (
            <div className="text-red-600">Error loading stats</div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {statsQuery.data?.total || 0}
                </div>
                <div className="text-sm text-gray-600">Total Locations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {statsQuery.data?.examples || 0}
                </div>
                <div className="text-sm text-gray-600">Example Locations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {statsQuery.data?.real || 0}
                </div>
                <div className="text-sm text-gray-600">Real Locations</div>
              </div>
            </div>
          )}
        </div>

        {/* Actions Card */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Actions</h2>

          <div className="space-y-4">
            <button
              onClick={handleSeed}
              disabled={seedMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {seedMutation.isPending ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Seed Example Locations (8 locations)
                </>
              )}
            </button>

            <button
              onClick={handleClear}
              disabled={clearMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {clearMutation.isPending ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="h-5 w-5" />
                  Clear Example Locations
                </>
              )}
            </button>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`mt-4 rounded-lg px-4 py-3 ${
                messageType === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Information</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Example locations are prefixed with "Example - " in the address</li>
            <li>• Seed action creates 8 test locations around default coordinates</li>
            <li>• Clear action only removes example locations (safe for production data)</li>
            <li>• These endpoints are only available in development mode</li>
          </ul>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            ← Back to Map
          </a>
        </div>
      </div>
    </div>
  );
}
