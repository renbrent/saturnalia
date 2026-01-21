import { useState, useEffect, useRef } from 'react';
import type { TLEData, SatellitePosition } from '../types/satellite';
import { calculatePosition, calculateGroundTrack } from '../services/satellite';
import { POSITION_UPDATE_INTERVAL } from '../constants';

export interface UseSatellitePositionResult {
  /** Current calculated position */
  position: SatellitePosition | null;
  /** Ground track positions (one orbit) */
  groundTrack: SatellitePosition[];
  /** Whether position calculation is valid */
  isValid: boolean;
  /** Error if calculation failed */
  error: Error | null;
}

/**
 * Hook to calculate and update satellite position in real-time
 */
export function useSatellitePosition(
  tle: TLEData | null,
  updateInterval: number = POSITION_UPDATE_INTERVAL
): UseSatellitePositionResult {
  const [position, setPosition] = useState<SatellitePosition | null>(null);
  const [groundTrack, setGroundTrack] = useState<SatellitePosition[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Calculate position
  useEffect(() => {
    if (!tle) {
      setPosition(null);
      setGroundTrack([]);
      setError(null);
      return;
    }

    // Calculate initial position
    const calculateAndSetPosition = () => {
      try {
        const pos = calculatePosition(tle);
        setPosition(pos);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Position calculation failed'));
      }
    };

    // Calculate initial position immediately
    calculateAndSetPosition();

    // Set up interval for updates
    intervalRef.current = window.setInterval(calculateAndSetPosition, updateInterval);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [tle, updateInterval]);

  // Calculate ground track (only when TLE changes, not on position updates)
  useEffect(() => {
    if (!tle) {
      setGroundTrack([]);
      return;
    }

    try {
      const track = calculateGroundTrack(tle, 100);
      setGroundTrack(track);
    } catch {
      // Ground track calculation failed, but position might still work
      setGroundTrack([]);
    }
  }, [tle]);

  return {
    position,
    groundTrack,
    isValid: position !== null && error === null,
    error,
  };
}
