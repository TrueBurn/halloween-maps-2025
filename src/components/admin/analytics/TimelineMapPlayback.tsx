'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { Play, Pause, SkipBack, SkipForward, Loader2 } from 'lucide-react';
import { env } from '~/env';

interface TimelineLocation {
  lat: number;
  lng: number;
}

interface TimelineInterval {
  time_bucket: string;
  locations: TimelineLocation[];
  user_count: number;
  center_lat: number;
  center_lng: number;
}

interface TimelineData {
  timeline: TimelineInterval[];
  summary: {
    total_unique_users: number;
    total_intervals: number;
    peak_user_count: number;
    peak_time: string;
    event_start: string | null;
    event_end: string | null;
    date: string;
    neighborhood: string;
  };
  last_updated: string;
}

const PLAYBACK_SPEEDS = [
  { label: '0.5x', value: 2000 },
  { label: '1x', value: 1000 },
  { label: '2x', value: 500 },
  { label: '4x', value: 250 },
] as const;

interface TimelineMapPlaybackProps {
  data: TimelineData;
}

export function TimelineMapPlayback({ data }: TimelineMapPlaybackProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const heatLayer = useRef<any>(null);
  const animationTimer = useRef<NodeJS.Timeout | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // Index into PLAYBACK_SPEEDS

  const currentInterval = data.timeline[currentIndex];
  const totalIntervals = data.timeline.length;

  // Initialize map
  useEffect(() => {
    if (mapInstance.current || !mapContainer.current) return;

    const map = L.map(mapContainer.current, {
      center: [env.NEXT_PUBLIC_DEFAULT_LAT, env.NEXT_PUBLIC_DEFAULT_LNG],
      zoom: env.NEXT_PUBLIC_DEFAULT_ZOOM,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstance.current = map;

    // Force invalidate size after a short delay
    setTimeout(() => {
      if (mapInstance.current) {
        mapInstance.current.invalidateSize();
      }
    }, 100);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update heatmap layer when current interval changes
  useEffect(() => {
    if (!mapInstance.current || !currentInterval) return;

    // Remove existing heat layer
    if (heatLayer.current) {
      try {
        mapInstance.current.removeLayer(heatLayer.current);
      } catch (error) {
        console.warn('[Timeline] Error removing old layer:', error);
      }
      heatLayer.current = null;
    }

    // Create new heat layer with current interval data
    if (currentInterval.locations && currentInterval.locations.length > 0) {
      try {
        // Convert to leaflet.heat format: [lat, lng, intensity]
        const heatData = currentInterval.locations.map((loc) => [loc.lat, loc.lng, 1.0]);

        heatLayer.current = (L as any).heatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 17,
          minOpacity: 0.5,
          max: 1.0,
          gradient: {
            0.0: '#6366f1', // Primary (indigo)
            0.5: '#ec4899', // Secondary (pink)
            1.0: '#f59e0b', // Warning (orange)
          },
        });

        // Add to map
        setTimeout(() => {
          if (heatLayer.current && mapInstance.current) {
            try {
              mapInstance.current.invalidateSize();
              heatLayer.current.addTo(mapInstance.current);

              // Fit bounds to show all locations in current interval
              const bounds = L.latLngBounds(currentInterval.locations.map((loc) => [loc.lat, loc.lng]));
              mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
            } catch (err) {
              console.error('[Timeline] Error adding heat layer:', err);
            }
          }
        }, 100);
      } catch (error) {
        console.error('[Timeline] Error creating heat layer:', error);
      }
    } else {
      // Reset to default view when no data
      if (mapInstance.current) {
        mapInstance.current.setView(
          [env.NEXT_PUBLIC_DEFAULT_LAT, env.NEXT_PUBLIC_DEFAULT_LNG],
          env.NEXT_PUBLIC_DEFAULT_ZOOM
        );
      }
    }
  }, [currentIndex, currentInterval]);

  // Animation playback
  useEffect(() => {
    if (isPlaying) {
      const speed = PLAYBACK_SPEEDS[playbackSpeed]?.value ?? 1000;

      animationTimer.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= totalIntervals - 1) {
            setIsPlaying(false); // Stop at end
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      if (animationTimer.current) {
        clearInterval(animationTimer.current);
        animationTimer.current = null;
      }
    }

    return () => {
      if (animationTimer.current) {
        clearInterval(animationTimer.current);
      }
    };
  }, [isPlaying, playbackSpeed, totalIntervals]);

  // Format time for display
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Calculate time range for current interval (5 minutes)
  const getTimeRange = () => {
    if (!currentInterval) return '';
    const start = new Date(currentInterval.time_bucket);
    const end = new Date(start.getTime() + 5 * 60 * 1000); // Add 5 minutes
    return `${formatTime(start.toISOString())} - ${formatTime(end.toISOString())}`;
  };

  // Handle controls
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setIsPlaying(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(totalIntervals - 1, prev + 1));
    setIsPlaying(false);
  };

  const handleSliderChange = (value: number) => {
    setCurrentIndex(value);
    setIsPlaying(false);
  };

  const handleSpeedChange = () => {
    setPlaybackSpeed((prev) => (prev + 1) % PLAYBACK_SPEEDS.length);
  };

  if (!currentInterval) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-surface rounded-lg border border-gray-700">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-text-secondary">Loading timeline data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-surface rounded-lg overflow-hidden border border-gray-700">
      {/* Map container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Playback controls overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000]">
        <div className="bg-surface px-4 py-3 rounded-lg shadow-md border border-gray-700">
          {/* Current interval info */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <p className="text-sm font-medium text-text-primary">
                👥 {currentInterval.user_count} Active {currentInterval.user_count === 1 ? 'User' : 'Users'}
              </p>
              <p className="text-xs text-text-secondary">{getTimeRange()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-secondary">
                Interval {currentIndex + 1} / {totalIntervals}
              </p>
            </div>
          </div>

          {/* Progress slider */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max={totalIntervals - 1}
              value={currentIndex}
              onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
              style={{
                background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(currentIndex / (totalIntervals - 1)) * 100}%, #374151 ${(currentIndex / (totalIntervals - 1)) * 100}%, #374151 100%)`,
              }}
            />
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous interval"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            <button
              onClick={handlePlayPause}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Play
                </>
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === totalIntervals - 1}
              className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next interval"
            >
              <SkipForward className="h-4 w-4" />
            </button>

            <button
              onClick={handleSpeedChange}
              className="ml-2 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
              title="Playback speed"
            >
              {PLAYBACK_SPEEDS[playbackSpeed]?.label ?? '1x'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
