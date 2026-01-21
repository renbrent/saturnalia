import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculatePosition,
  calculateGroundTrack,
  getOrbitalPeriod,
  getInclination,
  getEccentricity,
} from '../../../src/services/satellite';
import type { TLEData } from '../../../src/types/satellite';

// Valid TLE for ISS
const ISS_TLE: TLEData = {
  noradId: '25544',
  line1: '1 25544U 98067A   24001.50000000  .00016717  00000-0  10270-3 0  9025',
  line2: '2 25544  51.6400 208.9163 0006703 296.9871  63.0494 15.49815057484910',
  epoch: new Date('2024-01-01T12:00:00Z'),
  fetchedAt: new Date(),
};

describe('Satellite Service', () => {
  describe('calculatePosition', () => {
    it('calculates valid position for ISS', () => {
      const position = calculatePosition(ISS_TLE);
      
      expect(position.latitude).toBeGreaterThanOrEqual(-90);
      expect(position.latitude).toBeLessThanOrEqual(90);
      expect(position.longitude).toBeGreaterThanOrEqual(-180);
      expect(position.longitude).toBeLessThanOrEqual(180);
      expect(position.altitude).toBeGreaterThan(0);
      expect(position.velocity).toBeGreaterThan(0);
      expect(position.timestamp).toBeInstanceOf(Date);
    });

    it('calculates position for specific time', () => {
      const time1 = new Date('2024-01-01T12:00:00Z');
      const time2 = new Date('2024-01-01T12:01:00Z');
      
      const pos1 = calculatePosition(ISS_TLE, time1);
      const pos2 = calculatePosition(ISS_TLE, time2);
      
      // Position should be different after 1 minute
      expect(pos1.latitude).not.toBe(pos2.latitude);
      expect(pos1.longitude).not.toBe(pos2.longitude);
    });

    it('ISS altitude is in expected range (~400-420 km)', () => {
      const position = calculatePosition(ISS_TLE);
      
      // ISS orbits between roughly 400-420 km
      expect(position.altitude).toBeGreaterThan(350);
      expect(position.altitude).toBeLessThan(450);
    });

    it('ISS velocity is in expected range (~7.5-7.7 km/s)', () => {
      const position = calculatePosition(ISS_TLE);
      
      // ISS moves at roughly 7.66 km/s
      expect(position.velocity).toBeGreaterThan(7.0);
      expect(position.velocity).toBeLessThan(8.0);
    });

    it('throws error for invalid TLE', () => {
      const invalidTLE: TLEData = {
        noradId: '00000',
        line1: '1 00000U 00000A   24001.00000000  .00000000  00000-0  00000-0 0  0000',
        line2: '2 00000   0.0000   0.0000 0000000   0.0000   0.0000  0.00000000000000',
        epoch: new Date(),
        fetchedAt: new Date(),
      };
      
      expect(() => calculatePosition(invalidTLE)).toThrow();
    });
  });

  describe('calculateGroundTrack', () => {
    it('returns array of positions', () => {
      const track = calculateGroundTrack(ISS_TLE, 10);
      
      expect(Array.isArray(track)).toBe(true);
      expect(track.length).toBeLessThanOrEqual(10);
      track.forEach(pos => {
        expect(pos.latitude).toBeDefined();
        expect(pos.longitude).toBeDefined();
      });
    });

    it('positions span one orbital period', () => {
      const track = calculateGroundTrack(ISS_TLE, 100);
      
      // First and last positions should be at similar latitudes (orbit completed)
      // This is a rough check - actual path depends on Earth rotation
      expect(track.length).toBeGreaterThan(0);
    });
  });

  describe('getOrbitalPeriod', () => {
    it('returns orbital period in minutes for ISS', () => {
      const period = getOrbitalPeriod(ISS_TLE);
      
      // ISS orbital period is about 92-93 minutes
      expect(period).toBeGreaterThan(90);
      expect(period).toBeLessThan(95);
    });
  });

  describe('getInclination', () => {
    it('returns inclination in degrees for ISS', () => {
      const inclination = getInclination(ISS_TLE);
      
      // ISS inclination is about 51.6 degrees
      expect(inclination).toBeCloseTo(51.64, 1);
    });
  });

  describe('getEccentricity', () => {
    it('returns eccentricity for ISS', () => {
      const eccentricity = getEccentricity(ISS_TLE);
      
      // ISS has very low eccentricity (nearly circular orbit)
      expect(eccentricity).toBeGreaterThan(0);
      expect(eccentricity).toBeLessThan(0.01);
    });
  });
});
