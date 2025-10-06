import { useEffect, useState, useCallback } from 'react';
import { createClient } from '~/lib/supabase/client';
import type { Tables } from '~/types/database.types';

type Location = Tables<'locations'>;

/**
 * Hook for admin use - fetches ALL locations regardless of is_participating status
 * Public-facing views should use useLocations() which filters to only participating locations
 */
export function useAllLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch ALL locations (no is_participating filter)
  const fetchLocations = useCallback(async (isManualRefresh = false) => {
    const supabase = createClient();

    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data, error: fetchError } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      const newLocations = data || [];
      setLocations(newLocations);
      setError(null);
    } catch (err) {
      console.error('Error fetching all locations:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch locations'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchLocations(true);
  }, [fetchLocations]);

  useEffect(() => {
    const supabase = createClient();

    fetchLocations();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('admin-locations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'locations',
        },
        (payload) => {
          console.log('Admin location change:', payload);
          // Refetch all locations on any change
          fetchLocations();
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLocations]);

  return { locations, loading, error, refreshing, refresh };
}
