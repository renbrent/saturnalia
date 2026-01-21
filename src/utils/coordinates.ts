import { EARTH_RADIUS_KM } from '../constants';

/**
 * Convert degrees to radians
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Normalize longitude to -180 to 180 range
 */
export function normalizeLongitude(longitude: number): number {
  let lng = longitude % 360;
  if (lng > 180) lng -= 360;
  if (lng < -180) lng += 360;
  return lng;
}

/**
 * Normalize latitude to -90 to 90 range
 */
export function normalizeLatitude(latitude: number): number {
  return Math.max(-90, Math.min(90, latitude));
}

/**
 * Convert azimuth (radians from north) to compass direction string
 */
export function azimuthToCompass(azimuthDegrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const normalized = ((azimuthDegrees % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return directions[index];
}

/**
 * Calculate distance between two points on Earth using Haversine formula
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Calculate look angles (azimuth, elevation) from observer to satellite
 */
export function calculateLookAngles(
  observerLat: number,
  observerLon: number,
  observerAlt: number,
  satLat: number,
  satLon: number,
  satAlt: number
): { azimuth: number; elevation: number; range: number } {
  const obsLatRad = degreesToRadians(observerLat);
  const obsLonRad = degreesToRadians(observerLon);
  const satLatRad = degreesToRadians(satLat);
  const satLonRad = degreesToRadians(satLon);

  // Observer position in ECEF-like coordinates
  const obsR = EARTH_RADIUS_KM + observerAlt / 1000;
  const satR = EARTH_RADIUS_KM + satAlt;

  // Range vector
  const x = satR * Math.cos(satLatRad) * Math.cos(satLonRad) - obsR * Math.cos(obsLatRad) * Math.cos(obsLonRad);
  const y = satR * Math.cos(satLatRad) * Math.sin(satLonRad) - obsR * Math.cos(obsLatRad) * Math.sin(obsLonRad);
  const z = satR * Math.sin(satLatRad) - obsR * Math.sin(obsLatRad);

  const range = Math.sqrt(x * x + y * y + z * z);

  // Transform to topocentric coordinates
  const south = -Math.sin(obsLatRad) * Math.cos(obsLonRad) * x - Math.sin(obsLatRad) * Math.sin(obsLonRad) * y + Math.cos(obsLatRad) * z;
  const east = -Math.sin(obsLonRad) * x + Math.cos(obsLonRad) * y;
  const up = Math.cos(obsLatRad) * Math.cos(obsLonRad) * x + Math.cos(obsLatRad) * Math.sin(obsLonRad) * y + Math.sin(obsLatRad) * z;

  // Calculate azimuth and elevation
  let azimuth = Math.atan2(east, -south);
  if (azimuth < 0) azimuth += 2 * Math.PI;
  const elevation = Math.asin(up / range);

  return {
    azimuth: radiansToDegrees(azimuth),
    elevation: radiansToDegrees(elevation),
    range,
  };
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(latitude: number, longitude: number): string {
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lonDir = longitude >= 0 ? 'E' : 'W';
  return `${Math.abs(latitude).toFixed(4)}°${latDir}, ${Math.abs(longitude).toFixed(4)}°${lonDir}`;
}
