'use client';

import { useEffect, useState } from 'react';
import { Filter, Loader2 } from 'lucide-react';

interface FilterUsage {
  filter_type: string;
  filter_value: string;
  usage_count: number;
}

export function FilterUsageCard() {
  const [filters, setFilters] = useState<FilterUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFilterUsage = async () => {
    try {
      const response = await fetch('/api/analytics/filter-usage');

      if (!response.ok) {
        throw new Error('Failed to fetch filter usage');
      }

      const data = await response.json();
      setFilters(data.filters || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching filter usage:', err);
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchFilterUsage();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchFilterUsage, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-lg border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Filter className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-text-primary">Filter Usage</h3>
        </div>
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || filters.length === 0) {
    return (
      <div className="bg-surface rounded-lg shadow-lg border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Filter className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-text-primary">Filter Usage</h3>
        </div>
        <p className="text-sm text-text-secondary text-center">
          {error || 'No filter data yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-lg border border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Filter className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">Filter Usage</h3>
          <p className="text-xs text-text-secondary">Top filters applied today</p>
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filters.map((filter, index) => (
          <div
            key={`${filter.filter_type}-${filter.filter_value}-${index}`}
            className="flex items-center justify-between p-3 bg-background rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-primary uppercase">
                  {filter.filter_type}
                </span>
              </div>
              <p className="text-sm text-text-primary truncate mt-0.5">
                {filter.filter_value}
              </p>
            </div>
            <div className="text-right ml-3">
              <div className="text-lg font-bold text-text-primary">
                {filter.usage_count}
              </div>
              <div className="text-xs text-text-secondary">uses</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
