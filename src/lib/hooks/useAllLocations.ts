import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const supabase = createClient();

    // Fetch ALL locations (no is_participating filter)
    async function fetchLocations() {
      try {
        setLoading(true);
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
      }
    }

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
  }, []);

  return { locations, loading, error };
}
