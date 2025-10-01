'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { X, Loader2, MapPin } from 'lucide-react';
import { createClient } from '~/lib/supabase/client';
import type { Tables } from '~/types/database.types';

const CoordinatePicker = dynamic(
  () => import('./CoordinatePicker').then((mod) => ({ default: mod.CoordinatePicker })),
  { ssr: false }
);

type Location = Tables<'locations'>;
type LocationInsert = Omit<Location, 'id' | 'created_at' | 'modified_at'>;

interface LocationFormProps {
  location?: Location;
  onClose: () => void;
  onSuccess: () => void;
}

export function LocationForm({ location, onClose, onSuccess }: LocationFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const [formData, setFormData] = useState<LocationInsert>({
    address: location?.address || '',
    latitude: location?.latitude || 0,
    longitude: location?.longitude || 0,
    location_type: location?.location_type || 'House',
    route: location?.route || null,
    is_start: location?.is_start || false,
    is_participating: location?.is_participating ?? true,
    has_candy: location?.has_candy ?? true,
    has_activity: location?.has_activity || false,
    activity_details: location?.activity_details || null,
    phone_number: location?.phone_number || null,
    email: location?.email || null,
  });

  const handleCoordinatesSelected = (lat: number, lng: number) => {
    setFormData({ ...formData, latitude: lat, longitude: lng });
    setShowPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();

    try {
      if (location) {
        // Update existing location
        const { error: updateError } = await supabase
          .from('locations')
          .update({ ...formData, modified_at: new Date().toISOString() })
          .eq('id', location.id);

        if (updateError) throw updateError;
      } else {
        // Create new location
        const { error: insertError } = await supabase
          .from('locations')
          .insert([formData]);

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving location:', err);
      setError(err instanceof Error ? err.message : 'Failed to save location');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-text-primary">
            {location ? 'Edit Location' : 'Add New Location'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-text-primary placeholder:text-text-secondary"
              placeholder="123 Main Street"
            />
          </div>

          {/* Coordinates */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-text-primary">
                Coordinates *
              </label>
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <MapPin className="h-4 w-4" />
                Pick from Map
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-background border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-text-primary placeholder:text-text-secondary"
                  placeholder="Latitude"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-background border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-text-primary placeholder:text-text-secondary"
                  placeholder="Longitude"
                />
              </div>
            </div>
          </div>

          {/* Location Type */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Location Type *
            </label>
            <select
              required
              value={formData.location_type}
              onChange={(e) => setFormData({ ...formData, location_type: e.target.value as Location['location_type'] })}
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-text-primary"
            >
              <option value="House">House</option>
              <option value="Table">Table</option>
              <option value="Car">Car</option>
              <option value="Parking">Parking</option>
              <option value="Refreshments">Refreshments</option>
            </select>
          </div>

          {/* Route - Only for starting points */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Age Group (Starting Points Only)
            </label>
            <select
              value={formData.route || ''}
              onChange={(e) => setFormData({ ...formData, route: (e.target.value || null) as Location['route'] })}
              disabled={!formData.is_start}
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Age Group</option>
              <option value="Over 8">Over 8</option>
              <option value="Under 8">Under 8</option>
              <option value="Toddlers">Toddlers</option>
            </select>
            {!formData.is_start && (
              <p className="text-xs text-text-secondary mt-1">
                Check "Starting Point" to assign an age group
              </p>
            )}
          </div>

          {/* Checkboxes */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_start}
                onChange={(e) => setFormData({ ...formData, is_start: e.target.checked, route: e.target.checked ? formData.route : null })}
                className="w-4 h-4 text-primary border-gray-700 rounded focus:ring-primary bg-background"
              />
              <span className="text-sm font-medium text-text-primary">Starting Point</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_participating}
                onChange={(e) => setFormData({ ...formData, is_participating: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-700 rounded focus:ring-primary bg-background"
              />
              <span className="text-sm font-medium text-text-primary">Participating</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.has_candy}
                onChange={(e) => setFormData({ ...formData, has_candy: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-700 rounded focus:ring-primary bg-background"
              />
              <span className="text-sm font-medium text-text-primary">Has Candy</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.has_activity}
                onChange={(e) => setFormData({ ...formData, has_activity: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-700 rounded focus:ring-primary bg-background"
              />
              <span className="text-sm font-medium text-text-primary">Has Activity</span>
            </label>
          </div>

          {/* Activity Details */}
          {formData.has_activity && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Activity Details
              </label>
              <textarea
                value={formData.activity_details || ''}
                onChange={(e) => setFormData({ ...formData, activity_details: e.target.value || null })}
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-text-primary placeholder:text-text-secondary"
                rows={3}
                placeholder="Describe the activity..."
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-950/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text-primary hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                location ? 'Update Location' : 'Create Location'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Coordinate Picker Modal */}
      {showPicker && (
        <CoordinatePicker
          initialLat={formData.latitude || undefined}
          initialLng={formData.longitude || undefined}
          onSelect={handleCoordinatesSelected}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
