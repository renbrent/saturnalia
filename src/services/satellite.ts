import {
  twoline2satrec,
  propagate,
  gstime,
  eciToGeodetic,
  degreesLong,
  degreesLat,
} from 'satellite.js';
import type { EciVec3 } from 'satellite.js';
import type { TLEData, SatellitePosition } from '../types/satellite';
import { normalizeLongitude } from '../utils/coordinates';

/**
 * Calculate satellite position at a given time
 */
export function calculatePosition(tle: TLEData, time: Date = new Date()): SatellitePosition {
  const satrec = twoline2satrec(tle.line1, tle.line2);
  const positionAndVelocity = propagate(satrec, time);

  // propagate can return null on error
  if (!positionAndVelocity) {
    throw new Error('Position calculation failed');
  }

  const { position, velocity } = positionAndVelocity;

  const gmst = gstime(time);
  const posVec = position as EciVec3<number>;
  const velVec = velocity as EciVec3<number>;

  const geodetic = eciToGeodetic(posVec, gmst);

  // Calculate velocity magnitude (km/s)
  const velocityMagnitude = Math.sqrt(
    velVec.x * velVec.x + velVec.y * velVec.y + velVec.z * velVec.z
  );

  return {
    latitude: degreesLat(geodetic.latitude),
    longitude: normalizeLongitude(degreesLong(geodetic.longitude)),
    altitude: geodetic.height,
    velocity: velocityMagnitude,
    timestamp: time,
  };
}

/**
 * Calculate ground track (array of positions over one orbit)
 */
export function calculateGroundTrack(
  tle: TLEData,
  points: number = 100,
  startTime: Date = new Date()
): SatellitePosition[] {
  const orbitalPeriod = getOrbitalPeriod(tle);
  const positions: SatellitePosition[] = [];

  for (let i = 0; i < points; i++) {
    const fraction = i / points;
    const time = new Date(startTime.getTime() + fraction * orbitalPeriod * 60 * 1000);
    try {
      positions.push(calculatePosition(tle, time));
    } catch {
      // Skip points that fail to calculate
    }
  }

  return positions;
}

/**
 * Get orbital period in minutes from TLE
 */
export function getOrbitalPeriod(tle: TLEData): number {
  // Mean motion is in revolutions per day (chars 52-63 of line 2)
  const meanMotionStr = tle.line2.substring(52, 63).trim();
  const meanMotion = parseFloat(meanMotionStr);

  // Convert to minutes per orbit
  return 1440 / meanMotion;
}

/**
 * Get semi-major axis in kilometers
 */
export function getSemiMajorAxis(tle: TLEData): number {
  const meanMotion = parseFloat(tle.line2.substring(52, 63).trim());
  const mu = 398600.4418; // Earth's gravitational parameter km³/s²

  // Mean motion in rad/s
  const n = (meanMotion * 2 * Math.PI) / 86400;

  // Semi-major axis from Kepler's third law
  return Math.pow(mu / (n * n), 1 / 3);
}

/**
 * Get inclination in degrees
 */
export function getInclination(tle: TLEData): number {
  return parseFloat(tle.line2.substring(8, 16).trim());
}

/**
 * Get eccentricity (decimal, not degrees)
 */
export function getEccentricity(tle: TLEData): number {
  // Eccentricity is stored as decimal without leading "0."
  const eccStr = tle.line2.substring(26, 33).trim();
  return parseFloat('0.' + eccStr);
}

/**
 * Calculate apogee altitude in kilometers
 */
export function getApogee(tle: TLEData): number {
  const a = getSemiMajorAxis(tle);
  const e = getEccentricity(tle);
  return a * (1 + e) - 6371; // Subtract Earth radius
}

/**
 * Calculate perigee altitude in kilometers
 */
export function getPerigee(tle: TLEData): number {
  const a = getSemiMajorAxis(tle);
  const e = getEccentricity(tle);
  return a * (1 - e) - 6371; // Subtract Earth radius
}
