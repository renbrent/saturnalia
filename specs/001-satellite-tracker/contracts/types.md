# TypeScript Contracts: Satellite Tracker

**Feature**: 001-satellite-tracker  
**Date**: 2026-01-20  
**Source**: [data-model.md](../data-model.md)

> These interfaces define the contract between components and services.
> Implementation MUST match these types exactly.

## Core Types

```typescript
// src/types/satellite.ts

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
```

## Location Types

```typescript
// src/types/location.ts

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
```

## Pass Prediction Types

```typescript
// src/types/pass.ts

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
  /** Pass duration in seconds */
  duration: number;
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
```

## State Types

```typescript
// src/types/state.ts

import type { Satellite, TLEData, SatellitePosition } from './satellite';
import type { UserLocation } from './location';
import type { PassPrediction } from './pass';

/**
 * User's favorited satellite
 */
export interface Favorite {
  /** NORAD ID of favorited satellite */
  noradId: string;
  /** When user added to favorites */
  addedAt: Date;
}

/**
 * Application error
 */
export interface AppError {
  /** Error code for programmatic handling */
  code: AppErrorCode;
  /** User-friendly error message */
  message: string;
  /** Technical details for logging */
  details?: unknown;
}

export type AppErrorCode =
  | 'TLE_FETCH_FAILED'
  | 'SATELLITE_NOT_FOUND'
  | 'POSITION_CALCULATION_FAILED'
  | 'LOCATION_PERMISSION_DENIED'
  | 'GEOCODING_FAILED'
  | 'STORAGE_FULL'
  | 'NETWORK_ERROR';

/**
 * Root application state
 */
export interface AppState {
  /** Currently tracked satellite */
  currentSatellite: Satellite | null;
  /** Latest calculated position */
  currentPosition: SatellitePosition | null;
  /** User's saved satellites */
  favorites: Favorite[];
  /** User's location for pass predictions */
  userLocation: UserLocation | null;
  /** Cached TLE data by NORAD ID */
  tleCache: Record<string, TLEData>;
  /** Current search results */
  searchResults: Satellite[];
  /** Calculated passes for current satellite */
  passes: PassPrediction[];
  /** Global loading state */
  isLoading: boolean;
  /** Current error if any */
  error: AppError | null;
}
```

## Service Interfaces

```typescript
// src/services/types.ts

import type { Satellite, TLEData, SatellitePosition } from '../types/satellite';
import type { UserLocation, GeocodingResult } from '../types/location';
import type { PassPrediction, Observer, PassPredictionOptions } from '../types/pass';
import type { Favorite } from '../types/state';

/**
 * CelesTrak TLE data service
 */
export interface ICelestrakService {
  /** Fetch TLE for a single satellite by NORAD ID */
  fetchTLE(noradId: string): Promise<TLEData>;
  
  /** Search satellites by name (partial match) */
  searchByName(query: string): Promise<Satellite[]>;
  
  /** Fetch TLE for multiple satellites */
  fetchBulkTLE(noradIds: string[]): Promise<TLEData[]>;
}

/**
 * Satellite position calculation service
 */
export interface ISatelliteService {
  /** Calculate current position from TLE */
  calculatePosition(tle: TLEData, time?: Date): SatellitePosition;
  
  /** Calculate ground track (array of positions over one orbit) */
  calculateGroundTrack(tle: TLEData, points?: number): SatellitePosition[];
  
  /** Get orbital period in minutes */
  getOrbitalPeriod(tle: TLEData): number;
}

/**
 * Pass prediction service
 */
export interface IPassService {
  /** Calculate upcoming passes for a satellite over observer */
  calculatePasses(
    tle: TLEData,
    observer: Observer,
    options?: PassPredictionOptions
  ): PassPrediction[];
}

/**
 * Geocoding service (Nominatim)
 */
export interface IGeocodingService {
  /** Search for locations by name */
  search(query: string): Promise<GeocodingResult[]>;
  
  /** Reverse geocode coordinates to display name */
  reverse(latitude: number, longitude: number): Promise<string>;
}

/**
 * Local storage service
 */
export interface IStorageService {
  /** Get user's favorites */
  getFavorites(): Favorite[];
  
  /** Save favorites */
  setFavorites(favorites: Favorite[]): void;
  
  /** Get cached TLE data */
  getTLECache(): Record<string, TLEData>;
  
  /** Set cached TLE data */
  setTLECache(cache: Record<string, TLEData>): void;
  
  /** Get last user location */
  getUserLocation(): UserLocation | null;
  
  /** Save user location */
  setUserLocation(location: UserLocation): void;
  
  /** Get last viewed satellite ID */
  getLastSatellite(): string | null;
  
  /** Save last viewed satellite ID */
  setLastSatellite(noradId: string): void;
}
```

## Component Props

```typescript
// src/components/types.ts

import type { Satellite, SatellitePosition, TrackedSatellite } from '../types/satellite';
import type { PassPrediction } from '../types/pass';
import type { UserLocation } from '../types/location';

/**
 * SatelliteMap component props
 */
export interface SatelliteMapProps {
  /** Satellite to display on map */
  satellite: TrackedSatellite | null;
  /** Ground track positions */
  groundTrack?: SatellitePosition[];
  /** User's location marker */
  userLocation?: UserLocation | null;
  /** Callback when map is clicked */
  onMapClick?: (latitude: number, longitude: number) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SearchBar component props
 */
export interface SearchBarProps {
  /** Search query value */
  value: string;
  /** Callback when query changes */
  onChange: (query: string) => void;
  /** Callback when search is submitted */
  onSubmit: () => void;
  /** Whether search is in progress */
  isLoading?: boolean;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * SearchResults component props
 */
export interface SearchResultsProps {
  /** Search results to display */
  results: Satellite[];
  /** Callback when a satellite is selected */
  onSelect: (satellite: Satellite) => void;
  /** Whether results are loading */
  isLoading?: boolean;
  /** Message when no results */
  emptyMessage?: string;
}

/**
 * SatelliteCard component props
 */
export interface SatelliteCardProps {
  /** Satellite to display */
  satellite: TrackedSatellite;
  /** Whether satellite is favorited */
  isFavorite: boolean;
  /** Callback to toggle favorite */
  onToggleFavorite: () => void;
  /** Callback to view pass predictions */
  onViewPasses?: () => void;
}

/**
 * FavoritesList component props
 */
export interface FavoritesListProps {
  /** List of favorite satellites */
  favorites: Satellite[];
  /** Currently selected satellite ID */
  selectedId?: string;
  /** Callback when a favorite is selected */
  onSelect: (satellite: Satellite) => void;
  /** Callback to remove a favorite */
  onRemove: (noradId: string) => void;
}

/**
 * PassList component props
 */
export interface PassListProps {
  /** Pass predictions to display */
  passes: PassPrediction[];
  /** Whether passes are loading */
  isLoading?: boolean;
  /** Callback when a pass is selected */
  onSelectPass?: (pass: PassPrediction) => void;
}

/**
 * LocationPicker component props
 */
export interface LocationPickerProps {
  /** Current user location */
  location: UserLocation | null;
  /** Callback when location is updated */
  onLocationChange: (location: UserLocation) => void;
  /** Whether location is being determined */
  isLoading?: boolean;
}
```

## Constants

```typescript
// src/constants/index.ts

/** ISS NORAD catalog ID - default satellite */
export const ISS_NORAD_ID = '25544';

/** CelesTrak API base URL */
export const CELESTRAK_BASE_URL = 'https://celestrak.org/NORAD/elements/gp.php';

/** Nominatim API base URL */
export const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/** Position update interval in milliseconds */
export const POSITION_UPDATE_INTERVAL = 1000;

/** TLE cache TTL in milliseconds (24 hours) */
export const TLE_CACHE_TTL = 24 * 60 * 60 * 1000;

/** Default pass prediction lookahead in days */
export const DEFAULT_PASS_DAYS = 7;

/** Minimum elevation for visible pass (degrees) */
export const MIN_PASS_ELEVATION = 10;

/** localStorage keys */
export const STORAGE_KEYS = {
  FAVORITES: 'saturnalia:favorites',
  TLE_CACHE: 'saturnalia:tle-cache',
  USER_LOCATION: 'saturnalia:user-location',
  LAST_SATELLITE: 'saturnalia:last-satellite',
} as const;
```
