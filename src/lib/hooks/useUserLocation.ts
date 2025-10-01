import { useEffect, useState } from 'react';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

const USER_LOCATION_KEY = 'halloween-maps-user-location';

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(() => {
    // Try to load cached location from localStorage
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(USER_LOCATION_KEY);
      if (cached) {
        try {
          return JSON.parse(cached) as UserLocation;
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if geolocation is available
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    // Success callback
    const handleSuccess = (position: GeolocationPosition) => {
      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
      setLocation(newLocation);
      setError(null);
      setLoading(false);

      // Cache location in localStorage
      localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(newLocation));
    };

    // Error callback
    const handleError = (err: GeolocationPositionError) => {
      let errorMessage = 'Failed to get your location';

      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'Location permission denied';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable';
          break;
        case err.TIMEOUT:
          errorMessage = 'Location request timed out';
          break;
      }

      setError(errorMessage);
      setLoading(false);
    };

    // Watch position for continuous updates
    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Allow cached position up to 60 seconds old
      }
    );

    // Cleanup
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return { location, error, loading };
}
