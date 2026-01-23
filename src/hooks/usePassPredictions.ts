/**
 * T070: usePassPredictions hook
 * Calculates satellite pass predictions for a given location
 */

import { useState, useCallback } from 'react';
import { calculatePasses } from '../services/passes';
import type { TLEData } from '../types/satellite';
import type { UserLocation } from '../types/location';
import type { PassPrediction, PassPredictionOptions } from '../types/pass';

export interface UsePassPredictionsResult {
  passes: PassPrediction[];
  isCalculating: boolean;
  error: Error | null;
  calculate: (tle: TLEData, location: UserLocation, options?: PassPredictionOptions) => void;
  clear: () => void;
}

/**
 * Hook to calculate and manage satellite pass predictions
 */
export function usePassPredictions(): UsePassPredictionsResult {
  const [passes, setPasses] = useState<PassPrediction[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Calculate passes for satellite and location
   */
  const calculate = useCallback(
    (tle: TLEData, location: UserLocation, options?: PassPredictionOptions) => {
      setIsCalculating(true);
      setError(null);

      try {
        // Run calculation in a setTimeout to avoid blocking UI
        setTimeout(() => {
          try {
            const predictions = calculatePasses(tle, location, options);
            setPasses(predictions);
            setIsCalculating(false);
          } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to calculate passes'));
            setPasses([]);
            setIsCalculating(false);
          }
        }, 0);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to calculate passes'));
        setPasses([]);
        setIsCalculating(false);
      }
    },
    []
  );

  /**
   * Clear current predictions
   */
  const clear = useCallback(() => {
    setPasses([]);
    setError(null);
  }, []);

  return {
    passes,
    isCalculating,
    error,
    calculate,
    clear,
  };
}
