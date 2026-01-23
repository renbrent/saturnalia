/**
 * T067: Pass prediction service
 * Calculates when satellites will be visible from a given location
 */

import * as satellite from 'satellite.js';
import type { TLEData } from '../types/satellite';
import type { UserLocation } from '../types/location';
import type { PassPrediction, PassPredictionOptions } from '../types/pass';

/**
 * Convert degrees to radians
 */
function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calculate azimuth and elevation for a satellite position
 */
function calculateLookAngles(
  observerGeodetic: satellite.GeodeticLocation,
  satelliteEci: satellite.EciVec3<number>,
  gmst: number
): { azimuth: number; elevation: number } {
  // Convert satellite ECI to ECF
  const satelliteEcf = satellite.eciToEcf(satelliteEci, gmst);

  // Calculate look angles
  const lookAngles = satellite.ecfToLookAngles(observerGeodetic, satelliteEcf);

  return {
    azimuth: radiansToDegrees(lookAngles.azimuth),
    elevation: radiansToDegrees(lookAngles.elevation),
  };
}

/**
 * Calculate satellite passes over observer location
 */
export function calculatePasses(
  tle: TLEData,
  location: UserLocation,
  options: PassPredictionOptions = {}
): PassPrediction[] {
  const {
    startDate = new Date(),
    days = 7,
    minElevation = 10,
  } = options;

  const passes: PassPrediction[] = [];

  // Parse TLE
  const satrec = satellite.twoline2satrec(tle.line1, tle.line2);

  // Observer location
  const observerGd: satellite.GeodeticLocation = {
    latitude: degreesToRadians(location.latitude),
    longitude: degreesToRadians(location.longitude),
    height: location.altitude / 1000, // Convert meters to km
  };

  // Search for passes
  const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
  const stepMinutes = 1; // Check every minute
  const stepMs = stepMinutes * 60 * 1000;

  let currentTime = new Date(startDate);
  let wasAboveHorizon = false;
  let passStart: Date | null = null;
  let passStartAzimuth = 0;
  let maxElevation = -90;
  let maxElevationTime: Date | null = null;
  let maxElevationAzimuth = 0;

  while (currentTime <= endDate) {
    const positionAndVelocity = satellite.propagate(satrec, currentTime);

    if (positionAndVelocity && positionAndVelocity.position && typeof positionAndVelocity.position !== 'boolean') {
      const gmst = satellite.gstime(currentTime);
      const lookAngles = calculateLookAngles(
        observerGd,
        positionAndVelocity.position as satellite.EciVec3<number>,
        gmst
      );

      const { azimuth, elevation } = lookAngles;
      const isAboveHorizon = elevation >= 0;

      // Detect rise
      if (isAboveHorizon && !wasAboveHorizon) {
        passStart = new Date(currentTime);
        passStartAzimuth = azimuth;
        maxElevation = elevation;
        maxElevationTime = new Date(currentTime);
        maxElevationAzimuth = azimuth;
      }

      // Track maximum elevation during pass
      if (isAboveHorizon && elevation > maxElevation) {
        maxElevation = elevation;
        maxElevationTime = new Date(currentTime);
        maxElevationAzimuth = azimuth;
      }

      // Detect set
      if (!isAboveHorizon && wasAboveHorizon && passStart && maxElevationTime) {
        // Pass just ended
        if (maxElevation >= minElevation) {
          passes.push({
            satelliteId: tle.noradId,
            startTime: passStart,
            endTime: new Date(currentTime),
            maxElevation,
            maxElevationTime,
            startAzimuth: passStartAzimuth,
            endAzimuth: azimuth,
            maxAzimuth: maxElevationAzimuth,
            duration: (currentTime.getTime() - passStart.getTime()) / 1000,
          });
        }

        // Reset for next pass
        passStart = null;
        maxElevationTime = null;
        maxElevation = -90;
      }

      wasAboveHorizon = isAboveHorizon;
    }

    currentTime = new Date(currentTime.getTime() + stepMs);
  }

  return passes;
}

/**
 * Determine if a pass is likely to be visible
 * Based on elevation and potentially time of day (for optical visibility)
 */
export function isPassVisible(pass: PassPrediction): boolean {
  // Basic visibility: passes with high elevation are more likely to be visible
  return pass.maxElevation >= 20;
}

/**
 * Get cardinal direction from azimuth angle
 */
export function getCardinalDirection(azimuth: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(azimuth / 22.5) % 16;
  return directions[index];
}

/**
 * Check if pass is within next 24 hours
 */
export function isPassUpcoming(pass: PassPrediction): boolean {
  const now = new Date();
  const hoursUntilPass = (pass.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilPass >= 0 && hoursUntilPass <= 24;
}
