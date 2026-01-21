import type { TLEData } from '../types/satellite';
import type { UserLocation } from '../types/location';
import type { Favorite } from '../types/state';
import { STORAGE_KEYS, TLE_CACHE_TTL } from '../constants';

/**
 * Safely parse JSON from localStorage
 */
function safeParseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely stringify and save to localStorage
 */
function safeSaveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Storage might be full or disabled
    console.error('Failed to save to localStorage:', e);
  }
}

/**
 * Get user's favorites from localStorage
 */
export function getFavorites(): Favorite[] {
  const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
  const favorites = safeParseJSON<Favorite[]>(raw, []);
  // Ensure dates are Date objects
  return favorites.map((f) => ({
    ...f,
    addedAt: new Date(f.addedAt),
  }));
}

/**
 * Save favorites to localStorage
 */
export function setFavorites(favorites: Favorite[]): void {
  safeSaveJSON(STORAGE_KEYS.FAVORITES, favorites);
}

/**
 * Add a satellite to favorites
 */
export function addFavorite(noradId: string): Favorite[] {
  const favorites = getFavorites();
  if (!favorites.some((f) => f.noradId === noradId)) {
    favorites.push({ noradId, addedAt: new Date() });
    setFavorites(favorites);
  }
  return favorites;
}

/**
 * Remove a satellite from favorites
 */
export function removeFavorite(noradId: string): Favorite[] {
  const favorites = getFavorites().filter((f) => f.noradId !== noradId);
  setFavorites(favorites);
  return favorites;
}

/**
 * Check if a satellite is favorited
 */
export function isFavorite(noradId: string): boolean {
  return getFavorites().some((f) => f.noradId === noradId);
}

// TLE Cache with dates stored as ISO strings
interface TLECacheEntry {
  noradId: string;
  line1: string;
  line2: string;
  epoch: string;
  fetchedAt: string;
}

/**
 * Get cached TLE data
 */
export function getTLECache(): Record<string, TLEData> {
  const raw = localStorage.getItem(STORAGE_KEYS.TLE_CACHE);
  const cache = safeParseJSON<Record<string, TLECacheEntry>>(raw, {});

  // Convert string dates back to Date objects and filter stale entries
  const result: Record<string, TLEData> = {};
  const now = Date.now();

  for (const [id, entry] of Object.entries(cache)) {
    const fetchedAt = new Date(entry.fetchedAt);
    if (now - fetchedAt.getTime() < TLE_CACHE_TTL) {
      result[id] = {
        ...entry,
        epoch: new Date(entry.epoch),
        fetchedAt,
      };
    }
  }

  return result;
}

/**
 * Save TLE cache
 */
export function setTLECache(cache: Record<string, TLEData>): void {
  // Convert Date objects to ISO strings for storage
  const toStore: Record<string, TLECacheEntry> = {};
  for (const [id, tle] of Object.entries(cache)) {
    toStore[id] = {
      ...tle,
      epoch: tle.epoch.toISOString(),
      fetchedAt: tle.fetchedAt.toISOString(),
    };
  }
  safeSaveJSON(STORAGE_KEYS.TLE_CACHE, toStore);
}

/**
 * Update a single TLE entry in cache
 */
export function updateTLECache(tle: TLEData): void {
  const cache = getTLECache();
  cache[tle.noradId] = tle;
  setTLECache(cache);
}

/**
 * Get cached TLE for a specific satellite
 */
export function getCachedTLE(noradId: string): TLEData | null {
  const cache = getTLECache();
  return cache[noradId] || null;
}

// User Location with date stored as ISO string
interface StoredUserLocation {
  latitude: number;
  longitude: number;
  altitude: number;
  source: 'gps' | 'manual' | 'geocoded';
  timestamp: string;
  displayName?: string;
}

/**
 * Get last user location
 */
export function getUserLocation(): UserLocation | null {
  const raw = localStorage.getItem(STORAGE_KEYS.USER_LOCATION);
  const stored = safeParseJSON<StoredUserLocation | null>(raw, null);
  if (!stored) return null;
  return {
    ...stored,
    timestamp: new Date(stored.timestamp),
  };
}

/**
 * Save user location
 */
export function setUserLocation(location: UserLocation): void {
  const toStore: StoredUserLocation = {
    ...location,
    timestamp: location.timestamp.toISOString(),
  };
  safeSaveJSON(STORAGE_KEYS.USER_LOCATION, toStore);
}

/**
 * Get last viewed satellite ID
 */
export function getLastSatellite(): string | null {
  return localStorage.getItem(STORAGE_KEYS.LAST_SATELLITE);
}

/**
 * Save last viewed satellite ID
 */
export function setLastSatellite(noradId: string): void {
  localStorage.setItem(STORAGE_KEYS.LAST_SATELLITE, noradId);
}

/**
 * Clear all app data from localStorage
 */
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
