'use client';

import { useState } from 'react';
import { useAllLocations } from '~/lib/hooks/useAllLocations';
import { Loader2, Edit, Trash2, MapPin, Plus } from 'lucide-react';
import type { Tables } from '~/types/database.types';

type Location = Tables<'locations'>;

interface LocationTableProps {
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
  onCreate: () => void;
}

export function LocationTable({ onEdit, onDelete, onCreate }: LocationTableProps) {
  const { locations, loading, error, refreshing, refresh } = useAllLocations();
  const [filter, setFilter] = useState('');

  const filteredLocations = locations.filter((loc) =>
    loc.address.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-error p-4">
        Error loading locations: {error.message}
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-lg border border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by address..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-lg text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh locations from database"
          >
            <Loader2 className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={onCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Location
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Address
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Age Group
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredLocations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                  {filter ? 'No locations match your search' : 'No locations yet'}
                </td>
              </tr>
            ) : (
              filteredLocations.map((location) => (
                <tr key={location.id} className="hover:bg-gray-900/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {location.is_start && (
                        <span className="text-success" title="Starting Point">
                          ⭐
                        </span>
                      )}
                      <span className="font-medium text-text-primary">{location.address}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {location.location_type}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {location.is_start ? (
                      <span className="text-text-primary font-medium">
                        {location.route || '-'}
                      </span>
                    ) : (
                      <span className="text-gray-600 italic">
                        -
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center gap-1">
                      {location.has_candy ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/20 text-success border border-success/30">
                          Has Candy
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-error/20 text-error border border-error/30">
                          No Candy
                        </span>
                      )}
                      {location.has_activity && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning/20 text-warning border border-warning/30">
                          Activity
                        </span>
                      )}
                      {!location.is_participating && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-text-secondary border border-gray-700">
                          Not Participating
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/?lat=${location.latitude}&lng=${location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-primary hover:bg-primary/20 rounded transition-colors"
                        title="View on map"
                      >
                        <MapPin className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => onEdit(location)}
                        className="p-2 text-text-secondary hover:bg-gray-800 hover:text-text-primary rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(location)}
                        className="p-2 text-error hover:bg-error/20 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-800 bg-gray-900/50">
        <p className="text-sm text-text-secondary">
          Showing {filteredLocations.length} of {locations.length} locations
        </p>
      </div>
    </div>
  );
}
