/**
 * Source of user location data
 */
export type LocationSource = 'gps' | 'manual' | 'geocoded';

/**
 * User's geographic location for pass predictions
 */
export interface UserLocation {
  /** Latitude in degrees (-90 to 90) */
  latitude: number;
  /** Longitude in degrees (-180 to 180) */
  longitude: number;
  /** Altitude in meters above sea level (default: 0) */
  altitude: number;
  /** How location was obtained */
  source: LocationSource;
  /** When location was obtained */
  timestamp: Date;
  /** Human-readable name (city, address) */
  displayName?: string;
}

/**
 * Geocoding result from Nominatim
 */
export interface GeocodingResult {
  /** Display name (e.g., "Tokyo, Japan") */
  displayName: string;
  /** Latitude */
  latitude: number;
  /** Longitude */
  longitude: number;
  /** Place type (city, town, etc.) */
  type: string;
}
