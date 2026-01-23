/**
 * Predicted satellite pass over observer location
 */
export interface PassPrediction {
  /** NORAD ID of the satellite */
  satelliteId: string;
  /** When satellite rises above horizon */
  startTime: Date;
  /** When satellite sets below horizon */
  endTime: Date;
  /** Peak elevation in degrees (0-90) */
  maxElevation: number;
  /** Time of peak elevation */
  maxElevationTime: Date;
  /** Compass direction at rise (0-360°, 0=North) */
  startAzimuth: number;
  /** Compass direction at set (0-360°) */
  endAzimuth: number;
  /** Compass direction at max elevation (0-360°) */
  maxAzimuth?: number;
  /** Pass duration in seconds */
  duration: number;
  /** Brightness/magnitude (optional, for optical visibility) */
  brightness?: number;
}

/**
 * Observer position for pass calculations
 */
export interface Observer {
  /** Latitude in degrees */
  latitude: number;
  /** Longitude in degrees */
  longitude: number;
  /** Altitude in meters above sea level */
  altitude: number;
}

/**
 * Options for pass prediction calculation
 */
export interface PassPredictionOptions {
  /** Start date for predictions (default: now) */
  startDate?: Date;
  /** Number of days to look ahead (default: 7) */
  days?: number;
  /** Minimum elevation to consider visible (default: 10°) */
  minElevation?: number;
}
