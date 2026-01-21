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

/**
 * Action types for AppContext reducer
 */
export type AppAction =
  | { type: 'SET_CURRENT_SATELLITE'; payload: Satellite | null }
  | { type: 'SET_CURRENT_POSITION'; payload: SatellitePosition | null }
  | { type: 'SET_FAVORITES'; payload: Favorite[] }
  | { type: 'ADD_FAVORITE'; payload: Favorite }
  | { type: 'REMOVE_FAVORITE'; payload: string }
  | { type: 'SET_USER_LOCATION'; payload: UserLocation | null }
  | { type: 'SET_TLE_CACHE'; payload: Record<string, TLEData> }
  | { type: 'UPDATE_TLE_CACHE'; payload: TLEData }
  | { type: 'SET_SEARCH_RESULTS'; payload: Satellite[] }
  | { type: 'SET_PASSES'; payload: PassPrediction[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: AppError | null }
  | { type: 'CLEAR_ERROR' };
