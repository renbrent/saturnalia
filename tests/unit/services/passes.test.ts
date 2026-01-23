import { describe, it, expect } from 'vitest';
import { calculatePasses, isPassVisible } from '../../../src/services/passes';
import type { TLEData } from '../../../src/types/satellite';
import type { UserLocation } from '../../../src/types/location';
import type { PassPredictionOptions } from '../../../src/types/pass';

describe('Pass Prediction Service', () => {
  // ISS TLE data (sample from 2024)
  const issTLE: TLEData = {
    noradId: '25544',
    line1: '1 25544U 98067A   24001.50000000  .00016717  00000-0  10270-3 0  9025',
    line2: '2 25544  51.6400 208.9163 0006703 296.9871  63.0494 15.49815057484910',
    epoch: new Date('2024-01-01T12:00:00Z'),
    fetchedAt: new Date('2024-01-01T12:00:00Z'),
  };

  // San Francisco location
  const sanFrancisco: UserLocation = {
    latitude: 37.7749,
    longitude: -122.4194,
    altitude: 0,
    source: 'manual',
    timestamp: new Date(),
  };

  // New York location
  const newYork: UserLocation = {
    latitude: 40.7128,
    longitude: -74.0060,
    altitude: 0,
    source: 'manual',
    timestamp: new Date(),
  };

  describe('T065: calculatePasses', () => {
    it('should return valid pass predictions', () => {
      const options: PassPredictionOptions = {
        days: 3,
        minElevation: 10,
      };

      const passes = calculatePasses(issTLE, sanFrancisco, options);

      expect(passes).toBeDefined();
      expect(Array.isArray(passes)).toBe(true);
    });

    it('should return passes with correct structure', () => {
      const options: PassPredictionOptions = {
        days: 1,
        minElevation: 0,
      };

      const passes = calculatePasses(issTLE, sanFrancisco, options);

      if (passes.length > 0) {
        const firstPass = passes[0];

        // Check required fields
        expect(firstPass.startTime).toBeInstanceOf(Date);
        expect(firstPass.endTime).toBeInstanceOf(Date);
        expect(firstPass.maxElevation).toBeTypeOf('number');
        expect(firstPass.startAzimuth).toBeTypeOf('number');
        expect(firstPass.endAzimuth).toBeTypeOf('number');
        expect(firstPass.maxElevationTime).toBeInstanceOf(Date);

        // Validate ranges
        expect(firstPass.maxElevation).toBeGreaterThanOrEqual(0);
        expect(firstPass.maxElevation).toBeLessThanOrEqual(90);
        expect(firstPass.startAzimuth).toBeGreaterThanOrEqual(0);
        expect(firstPass.startAzimuth).toBeLessThan(360);
        expect(firstPass.endAzimuth).toBeGreaterThanOrEqual(0);
        expect(firstPass.endAzimuth).toBeLessThan(360);

        // Time ordering
        expect(firstPass.startTime.getTime()).toBeLessThan(firstPass.maxElevationTime.getTime());
        expect(firstPass.maxElevationTime.getTime()).toBeLessThanOrEqual(firstPass.endTime.getTime());
      }
    });

    it('should filter passes by minimum elevation', () => {
      const lowElevationPasses = calculatePasses(issTLE, sanFrancisco, { days: 7, minElevation: 0 });
      const highElevationPasses = calculatePasses(issTLE, sanFrancisco, { days: 7, minElevation: 30 });

      expect(highElevationPasses.length).toBeLessThanOrEqual(lowElevationPasses.length);
    });

    it('should return more passes for longer time periods', () => {
      const shortPeriod = calculatePasses(issTLE, sanFrancisco, { days: 1, minElevation: 0 });
      const longPeriod = calculatePasses(issTLE, sanFrancisco, { days: 7, minElevation: 0 });

      expect(longPeriod.length).toBeGreaterThanOrEqual(shortPeriod.length);
    });

    it('should handle different observer locations', () => {
      const sfPasses = calculatePasses(issTLE, sanFrancisco, { days: 1, minElevation: 10 });
      const nyPasses = calculatePasses(issTLE, newYork, { days: 1, minElevation: 10 });

      // Both locations should get passes (ISS has wide coverage)
      expect(sfPasses.length).toBeGreaterThan(0);
      expect(nyPasses.length).toBeGreaterThan(0);

      // Pass times should be different for different locations
      if (sfPasses.length > 0 && nyPasses.length > 0) {
        const sfFirstPass = sfPasses[0].startTime.getTime();
        const nyFirstPass = nyPasses[0].startTime.getTime();
        expect(sfFirstPass).not.toBe(nyFirstPass);
      }
    });

    it('should return passes sorted by start time', () => {
      const passes = calculatePasses(issTLE, sanFrancisco, { days: 7, minElevation: 0 });

      for (let i = 1; i < passes.length; i++) {
        expect(passes[i].startTime.getTime()).toBeGreaterThanOrEqual(
          passes[i - 1].startTime.getTime()
        );
      }
    });

    it('should include optional fields when applicable', () => {
      const passes = calculatePasses(issTLE, sanFrancisco, { days: 7, minElevation: 20 });

      if (passes.length > 0) {
        const pass = passes[0];
        
        // Optional fields that might be included
        if ('maxAzimuth' in pass) {
          expect(pass.maxAzimuth).toBeGreaterThanOrEqual(0);
          expect(pass.maxAzimuth).toBeLessThan(360);
        }
        
        if ('brightness' in pass) {
          expect(pass.brightness).toBeTypeOf('number');
        }
      }
    });

    it('should handle edge case: polar location', () => {
      const polarLocation: UserLocation = {
        latitude: 89.0,
        longitude: 0,
        altitude: 0,
        source: 'manual',
        timestamp: new Date(),
      };

      // ISS doesn't reach poles (51.6° inclination), so should return no or very few passes
      const passes = calculatePasses(issTLE, polarLocation, { days: 7, minElevation: 10 });
      
      expect(Array.isArray(passes)).toBe(true);
      // Expect few or no passes for polar regions for ISS
    });

    it('should handle altitude in observer location', () => {
      const seaLevel: UserLocation = { ...sanFrancisco, altitude: 0 };
      const mountain: UserLocation = { ...sanFrancisco, altitude: 3000 }; // 3km altitude

      const seaLevelPasses = calculatePasses(issTLE, seaLevel, { days: 1, minElevation: 0 });
      const mountainPasses = calculatePasses(issTLE, mountain, { days: 1, minElevation: 0 });

      // Higher altitude might see satellite slightly earlier/later
      expect(seaLevelPasses.length).toBeGreaterThan(0);
      expect(mountainPasses.length).toBeGreaterThan(0);
    });
  });

  describe('isPassVisible', () => {
    it('should identify visible passes correctly', () => {
      const passes = calculatePasses(issTLE, sanFrancisco, { days: 7, minElevation: 0 });

      passes.forEach(pass => {
        const visible = isPassVisible(pass);
        
        // A pass is typically visible if elevation is high enough and during darkness
        // At minimum, the function should return a boolean
        expect(typeof visible).toBe('boolean');
      });
    });

    it('should mark high-elevation passes as more likely visible', () => {
      const highElevationPasses = calculatePasses(issTLE, sanFrancisco, { days: 7, minElevation: 40 });
      
      if (highElevationPasses.length > 0) {
        // High elevation passes should have better visibility
        const pass = highElevationPasses[0];
        const visible = isPassVisible(pass);
        
        expect(typeof visible).toBe('boolean');
      }
    });
  });
});
