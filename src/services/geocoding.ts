/**
 * T068: Geocoding service for manual location entry
 * Uses Nominatim (OpenStreetMap) for geocoding
 */

import type { UserLocation } from '../types/location';

/**
 * Geocoding result from Nominatim
 */
export interface GeocodingResult {
  displayName: string;
  latitude: number;
  longitude: number;
  type: string;
}

/**
 * Nominatim API base URL
 */
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/**
 * Search for a location by name/address
 */
export async function searchLocation(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      q: query.trim(),
      format: 'json',
      limit: '5',
      addressdetails: '1',
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
      headers: {
        'User-Agent': 'SatelliteTracker/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    return data.map((item: any) => ({
      displayName: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      type: item.type || 'location',
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to search location. Please try again.');
  }
}

/**
 * Convert geocoding result to UserLocation
 */
export function geocodingResultToUserLocation(
  result: GeocodingResult
): UserLocation {
  return {
    latitude: result.latitude,
    longitude: result.longitude,
    altitude: 0, // Nominatim doesn't provide altitude
    source: 'geocoded',
    timestamp: new Date(),
    displayName: result.displayName,
  };
}

/**
 * Reverse geocode coordinates to get location name
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
      format: 'json',
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`, {
      headers: {
        'User-Agent': 'SatelliteTracker/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
}
