import { useEffect, useState } from 'react';
import { getPostHogClient } from '~/lib/posthog/client';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

const USER_LOCATION_KEY = 'halloween-maps-user-location';

type LocationState = { location: UserLocation | null; error: string | null; loading: boolean };

// One shared watch for the whole app: every hook instance used to call watchPosition itself,
// so a page with two consumers (page + map/list) triggered two permission requests on iOS.
// ponytail: watch is never cleared; it lives as long as the tab, which is what the map wants anyway.
let state: LocationState | null = null;
const listeners = new Set<(s: LocationState) => void>();
let watching = false;

function setState(patch: Partial<LocationState>) {
  state = { ...state!, ...patch };
  listeners.forEach((l) => l(state!));
}

function startWatching() {
  if (watching) return;
  watching = true;

  if (!navigator.geolocation) {
    setState({ error: 'Geolocation is not supported by your browser', loading: false });
    return;
  }

  const handleSuccess = (position: GeolocationPosition) => {
    const newLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };
    const firstFix = state!.loading || state!.error !== null;
    setState({ location: newLocation, error: null, loading: false });

    // Cache location in localStorage
    localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(newLocation));

    // Track GPS permission granted (once, not on every position update)
    if (firstFix) {
      getPostHogClient()?.capture('map_user_location_enabled', {
        granted: true,
        accuracy: position.coords.accuracy,
      });
    }
  };

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

    setState({ error: errorMessage, loading: false });

    // Track GPS permission denied or error
    getPostHogClient()?.capture('map_user_location_enabled', {
      granted: false,
      error_code: err.code,
      error_message: errorMessage,
    });
  };

  navigator.geolocation.watchPosition(handleSuccess, handleError, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000, // Allow cached position up to 60 seconds old
  });
}

function initialState(): LocationState {
  // Try to load cached location from localStorage
  let location: UserLocation | null = null;
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(USER_LOCATION_KEY);
      if (cached) location = JSON.parse(cached) as UserLocation;
    } catch {
      location = null;
    }
  }
  return { location, error: null, loading: true };
}

export function useUserLocation() {
  const [current, setCurrent] = useState<LocationState>(() => (state ??= initialState()));

  useEffect(() => {
    listeners.add(setCurrent);
    setCurrent(state!);
    startWatching();
    return () => {
      listeners.delete(setCurrent);
    };
  }, []);

  return current;
}
