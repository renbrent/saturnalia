/**
 * T069: useUserLocation hook with Geolocation API
 * Manages user's location for pass predictions
 */

import { useState, useEffect, useCallback } from 'react';
import type { UserLocation } from '../types/location';
import { getUserLocation, setUserLocation as saveUserLocation } from '../services/storage';
import { reverseGeocode } from '../services/geocoding';

export interface UseUserLocationResult {
  location: UserLocation | null;
  isLoading: boolean;
  error: Error | null;
  requestLocation: () => Promise<void>;
  setManualLocation: (location: UserLocation) => void;
  clearLocation: () => void;
}

/**
 * Hook to manage user location with GPS and manual entry
 */
export function useUserLocation(): UseUserLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load saved location on mount
  useEffect(() => {
    const savedLocation = getUserLocation();
    if (savedLocation) {
      setLocation(savedLocation);
    }
  }, []);

  /**
   * Request location from browser Geolocation API
   */
  const requestLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError(new Error('Geolocation is not supported by your browser'));
      setIsLoading(false);
      return;
    }

    // Helper to get position with given options
    const getPosition = (options: PositionOptions): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    };

    try {
      let position: GeolocationPosition;
      
      try {
        // First try with low accuracy (faster, less battery)
        position = await getPosition({
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000,
        });
      } catch (firstError) {
        // If that fails, try with high accuracy as fallback
        // Some devices only provide location with high accuracy enabled
        console.warn('Low accuracy geolocation failed, trying high accuracy:', firstError);
        position = await getPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      }

      // Get location name via reverse geocoding
      let displayName: string | undefined;
      try {
        displayName = await reverseGeocode(
          position.coords.latitude,
          position.coords.longitude
        );
      } catch (e) {
        console.warn('Failed to get location name:', e);
      }

      const userLocation: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        altitude: position.coords.altitude || 0,
        source: 'gps',
        timestamp: new Date(),
        displayName,
      };

      setLocation(userLocation);
      saveUserLocation(userLocation);
    } catch (err) {
      console.error('Geolocation error:', err);
      
      let errorMessage = 'Failed to get location';
      
      if (err && typeof err === 'object' && 'code' in err) {
        const error = err as GeolocationPositionError;
        
        if (error.code === 1) { // PERMISSION_DENIED
          errorMessage = 'Location permission denied. Please enable location access in your browser settings or search for a location manually.';
        } else if (error.code === 2) { // POSITION_UNAVAILABLE
          errorMessage = 'Location unavailable. Please check your device settings or search for a location manually.';
        } else if (error.code === 3) { // TIMEOUT
          errorMessage = 'Location request timed out. Please try again or search for a location manually.';
        }
      }

      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Set location manually (from geocoding or user input)
   */
  const setManualLocation = useCallback((newLocation: UserLocation) => {
    setLocation(newLocation);
    saveUserLocation(newLocation);
    setError(null);
  }, []);

  /**
   * Clear current location
   */
  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  return {
    location,
    isLoading,
    error,
    requestLocation,
    setManualLocation,
    clearLocation,
  };
}
