import { useState, useEffect, useCallback } from 'react';
import type { TLEData, Satellite } from '../types/satellite';
import { fetchTLE } from '../services/celestrak';
import { getCachedTLE, updateTLECache } from '../services/storage';
import { isTLEStale } from '../utils/tle-parser';
import { TLE_CACHE_TTL } from '../constants';

export interface UseTLEDataResult {
  /** TLE data for the satellite */
  tle: TLEData | null;
  /** Satellite metadata */
  satellite: Satellite | null;
  /** Whether TLE is being fetched */
  isLoading: boolean;
  /** Error if fetch failed */
  error: Error | null;
  /** Force refresh TLE data */
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and cache TLE data for a satellite
 */
export function useTLEData(noradId: string | null): UseTLEDataResult {
  const [tle, setTLE] = useState<TLEData | null>(null);
  const [satellite, setSatellite] = useState<Satellite | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (id: string, forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cached = getCachedTLE(id);
        if (cached && !isTLEStale(cached, TLE_CACHE_TTL)) {
          setTLE(cached);
          // We don't have full satellite data in cache, but TLE has noradId
          setSatellite({ noradId: cached.noradId, name: '' });
          setIsLoading(false);
          return;
        }
      }

      // Fetch fresh TLE
      const { satellite: sat, tle: tleData } = await fetchTLE(id);
      
      // Update cache
      updateTLECache(tleData);
      
      setTLE(tleData);
      setSatellite(sat);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch TLE'));
      // Keep stale data if available
      const stale = getCachedTLE(id);
      if (stale) {
        setTLE(stale);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch when noradId changes
  useEffect(() => {
    if (noradId) {
      fetchData(noradId);
    } else {
      setTLE(null);
      setSatellite(null);
    }
  }, [noradId, fetchData]);

  const refresh = useCallback(async () => {
    if (noradId) {
      await fetchData(noradId, true);
    }
  }, [noradId, fetchData]);

  return {
    tle,
    satellite,
    isLoading,
    error,
    refresh,
  };
}
