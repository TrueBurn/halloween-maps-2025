'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { X, MapPin, Copy, Check } from 'lucide-react';
import { env } from '~/env';

interface CoordinatePickerProps {
  initialLat?: number;
  initialLng?: number;
  onSelect: (lat: number, lng: number) => void;
  onClose: () => void;
}

export function CoordinatePicker({ initialLat, initialLng, onSelect, onClose }: CoordinatePickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [coordinates, setCoordinates] = useState({
    lat: initialLat || env.NEXT_PUBLIC_DEFAULT_LAT,
    lng: initialLng || env.NEXT_PUBLIC_DEFAULT_LNG,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    // Initialize map
    const map = L.map(mapContainer.current, {
      center: [coordinates.lat, coordinates.lng],
      zoom: 16,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add initial marker
    const marker = L.marker([coordinates.lat, coordinates.lng], {
      draggable: true,
      icon: L.divIcon({
        className: 'coordinate-picker-marker',
        html: '<div style="background: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);"></div>',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      }),
    }).addTo(map);

    markerRef.current = marker;

    // Update coordinates when marker is dragged
    marker.on('dragend', () => {
      const latlng = marker.getLatLng();
      setCoordinates({ lat: latlng.lat, lng: latlng.lng });
    });

    // Update marker position when map is clicked
    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      setCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const handleConfirm = () => {
    onSelect(coordinates.lat, coordinates.lng);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${coordinates.lat}, ${coordinates.lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Pick Coordinates</h2>
            <p className="text-sm text-gray-600 mt-1">Click or drag the marker to select a location</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Map */}
        <div className="flex-1 relative min-h-[400px]">
          <div ref={mapContainer} className="absolute inset-0" />
        </div>

        {/* Footer with coordinates and actions */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Selected Coordinates</div>
                  <div className="font-mono text-sm font-medium text-gray-900">
                    {coordinates.lat.toFixed(7)}, {coordinates.lng.toFixed(7)}
                  </div>
                </div>
                <button
                  onClick={handleCopy}
                  className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                  title="Copy coordinates"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <MapPin className="h-4 w-4" />
              Use These Coordinates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
