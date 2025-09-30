import { useEffect, useState } from 'react';
import { createClient } from '~/lib/supabase/client';
import type { Tables } from '~/types/database.types';

type Location = Tables<'locations'>;

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Fetch locations
    async function fetchLocations() {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('locations')
          .select('*')
          .eq('is_participating', true)
          .order('created_at', { ascending: true });

        if (fetchError) throw fetchError;

        setLocations(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch locations'));
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('locations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'locations',
        },
        (payload) => {
          console.log('Location change:', payload);
          // Refetch locations on any change
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
