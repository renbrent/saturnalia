import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getFavorites,
  setFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  getTLECache,
  setTLECache,
  getCachedTLE,
  updateTLECache,
  getUserLocation,
  setUserLocation,
  getLastSatellite,
  setLastSatellite,
  clearAllData,
} from '../../../src/services/storage';
import type { Favorite } from '../../../src/types/state';
import type { TLEData } from '../../../src/types/satellite';
import type { UserLocation } from '../../../src/types/location';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Storage Service', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Favorites', () => {
    it('returns empty array when no favorites exist', () => {
      const favorites = getFavorites();
      expect(favorites).toEqual([]);
    });

    it('saves and retrieves favorites', () => {
      const favorites: Favorite[] = [
        { noradId: '25544', addedAt: new Date('2024-01-01') },
        { noradId: '20580', addedAt: new Date('2024-01-02') },
      ];
      
      setFavorites(favorites);
      const retrieved = getFavorites();
      
      expect(retrieved).toHaveLength(2);
      expect(retrieved[0].noradId).toBe('25544');
      expect(retrieved[0].addedAt).toBeInstanceOf(Date);
    });

    it('adds a new favorite', () => {
      const result = addFavorite('25544');
      
      expect(result).toHaveLength(1);
      expect(result[0].noradId).toBe('25544');
    });

    it('does not add duplicate favorites', () => {
      addFavorite('25544');
      const result = addFavorite('25544');
      
      expect(result).toHaveLength(1);
    });

    it('removes a favorite', () => {
      addFavorite('25544');
      addFavorite('20580');
      const result = removeFavorite('25544');
      
      expect(result).toHaveLength(1);
      expect(result[0].noradId).toBe('20580');
    });

    it('checks if satellite is favorite', () => {
      addFavorite('25544');
      
      expect(isFavorite('25544')).toBe(true);
      expect(isFavorite('99999')).toBe(false);
    });
  });

  describe('TLE Cache', () => {
    const sampleTLE: TLEData = {
      noradId: '25544',
      line1: '1 25544U 98067A   24001.50000000  .00016717  00000-0  10270-3 0  9025',
      line2: '2 25544  51.6400 208.9163 0006703 296.9871  63.0494 15.49815057484910',
      epoch: new Date('2024-01-01'),
      fetchedAt: new Date(),
    };

    it('returns empty cache when none exists', () => {
      const cache = getTLECache();
      expect(cache).toEqual({});
    });

    it('saves and retrieves TLE cache', () => {
      const cache = { '25544': sampleTLE };
      
      setTLECache(cache);
      const retrieved = getTLECache();
      
      expect(retrieved['25544']).toBeDefined();
      expect(retrieved['25544'].noradId).toBe('25544');
      expect(retrieved['25544'].epoch).toBeInstanceOf(Date);
    });

    it('updates single TLE in cache', () => {
      updateTLECache(sampleTLE);
      
      const cached = getCachedTLE('25544');
      expect(cached).not.toBeNull();
      expect(cached?.noradId).toBe('25544');
    });

    it('returns null for non-existent cached TLE', () => {
      expect(getCachedTLE('99999')).toBeNull();
    });

    it('filters out stale TLE entries', () => {
      const staleTLE: TLEData = {
        ...sampleTLE,
        fetchedAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
      };
      
      setTLECache({ '25544': staleTLE });
      const cache = getTLECache();
      
      // Stale entries should be filtered out
      expect(cache['25544']).toBeUndefined();
    });
  });

  describe('User Location', () => {
    const sampleLocation: UserLocation = {
      latitude: 35.6762,
      longitude: 139.6503,
      altitude: 40,
      source: 'gps',
      timestamp: new Date(),
      displayName: 'Tokyo, Japan',
    };

    it('returns null when no location exists', () => {
      expect(getUserLocation()).toBeNull();
    });

    it('saves and retrieves user location', () => {
      setUserLocation(sampleLocation);
      const retrieved = getUserLocation();
      
      expect(retrieved).not.toBeNull();
      expect(retrieved?.latitude).toBe(35.6762);
      expect(retrieved?.displayName).toBe('Tokyo, Japan');
      expect(retrieved?.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Last Satellite', () => {
    it('returns null when no last satellite exists', () => {
      expect(getLastSatellite()).toBeNull();
    });

    it('saves and retrieves last satellite', () => {
      setLastSatellite('25544');
      expect(getLastSatellite()).toBe('25544');
    });
  });

  describe('clearAllData', () => {
    it('removes all app data from localStorage', () => {
      addFavorite('25544');
      setLastSatellite('25544');
      
      clearAllData();
      
      expect(getFavorites()).toEqual([]);
      expect(getLastSatellite()).toBeNull();
    });
  });
});
