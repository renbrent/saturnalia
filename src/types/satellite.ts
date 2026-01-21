/**
 * NORAD-cataloged satellite
 */
export interface Satellite {
  /** NORAD catalog number (e.g., "25544" for ISS) */
  noradId: string;
  /** Common name (e.g., "ISS (ZARYA)") */
  name: string;
  /** International designator (e.g., "1998-067A") */
  intlDesignator?: string;
  /** Launch date if known */
  launchDate?: Date;
  /** Decay/reentry date if applicable */
  decayDate?: Date;
}

/**
 * Two-Line Element set for orbital propagation
 */
export interface TLEData {
  /** NORAD catalog number */
  noradId: string;
  /** TLE line 1 (69 characters) */
  line1: string;
  /** TLE line 2 (69 characters) */
  line2: string;
  /** TLE epoch (derived from line 1) */
  epoch: Date;
  /** When TLE was fetched from source */
  fetchedAt: Date;
}

/**
 * Calculated satellite position at a moment in time
 */
export interface SatellitePosition {
  /** Latitude in degrees (-90 to 90) */
  latitude: number;
  /** Longitude in degrees (-180 to 180) */
  longitude: number;
  /** Altitude in kilometers above Earth surface */
  altitude: number;
  /** Velocity in kilometers per second */
  velocity: number;
  /** Time of this position */
  timestamp: Date;
}

/**
 * Combined satellite with current TLE and position
 */
export interface TrackedSatellite extends Satellite {
  tle: TLEData;
  position: SatellitePosition;
}
