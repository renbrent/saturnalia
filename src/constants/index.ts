/** ISS NORAD catalog ID - default satellite */
export const ISS_NORAD_ID = '25544';

/** CelesTrak API base URL */
export const CELESTRAK_BASE_URL = 'https://celestrak.org/NORAD/elements/gp.php';

/** Nominatim API base URL */
export const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/** MapTiler Style URL (requires API key) */
export const MAPTILER_STYLE_URL = 'https://api.maptiler.com/maps/streets-v2/style.json';

/** Position update interval in milliseconds */
export const POSITION_UPDATE_INTERVAL = 1000;

/** TLE cache TTL in milliseconds (24 hours) */
export const TLE_CACHE_TTL = 24 * 60 * 60 * 1000;

/** Default pass prediction lookahead in days */
export const DEFAULT_PASS_DAYS = 7;

/** Minimum elevation for visible pass (degrees) */
export const MIN_PASS_ELEVATION = 10;

/** Search debounce delay in milliseconds */
export const SEARCH_DEBOUNCE_MS = 300;

/** Earth radius in kilometers */
export const EARTH_RADIUS_KM = 6371;

/** localStorage keys */
export const STORAGE_KEYS = {
  FAVORITES: 'saturnalia:favorites',
  TLE_CACHE: 'saturnalia:tle-cache',
  USER_LOCATION: 'saturnalia:user-location',
  LAST_SATELLITE: 'saturnalia:last-satellite',
} as const;

/** Default map view settings */
export const DEFAULT_MAP_VIEW = {
  latitude: 0,
  longitude: 0,
  zoom: 2,
} as const;
