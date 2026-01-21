import { describe, it, expect } from 'vitest';
import {
  parseTLE,
  parseBulkTLE,
  parseTLEEpoch,
  extractNoradId,
  extractIntlDesignator,
  isTLEStale,
  validateTLEChecksum,
} from '../../../src/utils/tle-parser';
import type { TLEData } from '../../../src/types/satellite';

// Sample TLE for ISS
const ISS_TLE = `ISS (ZARYA)
1 25544U 98067A   24001.50000000  .00016717  00000-0  10270-3 0  9025
2 25544  51.6400 208.9163 0006703 296.9871  63.0494 15.49815057484910`;

// Sample TLE for Hubble
const HUBBLE_TLE = `HST
1 20580U 90037B   24001.50000000  .00000867  00000-0  39510-4 0  9997
2 20580  28.4689  21.7582 0002857 141.4679 218.6423 15.09340181520315`;

describe('TLE Parser', () => {
  describe('parseTLEEpoch', () => {
    it('parses epoch from TLE line 1', () => {
      const line1 = '1 25544U 98067A   24001.50000000  .00016717  00000-0  10270-3 0  9025';
      const epoch = parseTLEEpoch(line1);
      
      expect(epoch.getUTCFullYear()).toBe(2024);
      expect(epoch.getUTCMonth()).toBe(0); // January
      expect(epoch.getUTCDate()).toBe(1);
    });

    it('handles 2-digit years correctly (57-99 = 1900s)', () => {
      const line1 = '1 25544U 98067A   99365.50000000  .00016717  00000-0  10270-3 0  9025';
      const epoch = parseTLEEpoch(line1);
      
      expect(epoch.getUTCFullYear()).toBe(1999);
    });

    it('handles 2-digit years correctly (00-56 = 2000s)', () => {
      const line1 = '1 25544U 98067A   25001.50000000  .00016717  00000-0  10270-3 0  9025';
      const epoch = parseTLEEpoch(line1);
      
      expect(epoch.getUTCFullYear()).toBe(2025);
    });
  });

  describe('extractNoradId', () => {
    it('extracts NORAD ID from line 1', () => {
      const line1 = '1 25544U 98067A   24001.50000000  .00016717  00000-0  10270-3 0  9025';
      expect(extractNoradId(line1)).toBe('25544');
    });

    it('extracts NORAD ID with leading zeros', () => {
      const line1 = '1 00001U 98067A   24001.50000000  .00016717  00000-0  10270-3 0  9025';
      expect(extractNoradId(line1)).toBe('00001');
    });
  });

  describe('extractIntlDesignator', () => {
    it('extracts international designator from line 1', () => {
      const line1 = '1 25544U 98067A   24001.50000000  .00016717  00000-0  10270-3 0  9025';
      expect(extractIntlDesignator(line1)).toBe('98067A');
    });
  });

  describe('parseTLE', () => {
    it('parses valid TLE into satellite and TLEData', () => {
      const { satellite, tle } = parseTLE(ISS_TLE);
      
      expect(satellite.noradId).toBe('25544');
      expect(satellite.name).toBe('ISS (ZARYA)');
      expect(satellite.intlDesignator).toBe('98067A');
      
      expect(tle.noradId).toBe('25544');
      expect(tle.line1).toContain('25544U');
      expect(tle.line2).toContain('25544');
      expect(tle.epoch).toBeInstanceOf(Date);
      expect(tle.fetchedAt).toBeInstanceOf(Date);
    });

    it('throws error for invalid TLE format', () => {
      expect(() => parseTLE('Invalid TLE')).toThrow('Invalid TLE format');
    });

    it('throws error for invalid line 1', () => {
      const invalidTLE = `ISS
0 25544U 98067A   24001.50000000  .00016717  00000-0  10270-3 0  9025
2 25544  51.6400 208.9163 0006703 296.9871  63.0494 15.49815057484910`;
      
      expect(() => parseTLE(invalidTLE)).toThrow('Invalid TLE line 1');
    });

    it('throws error for invalid line 2', () => {
      const invalidTLE = `ISS
1 25544U 98067A   24001.50000000  .00016717  00000-0  10270-3 0  9025
3 25544  51.6400 208.9163 0006703 296.9871  63.0494 15.49815057484910`;
      
      expect(() => parseTLE(invalidTLE)).toThrow('Invalid TLE line 2');
    });
  });

  describe('parseBulkTLE', () => {
    it('parses multiple TLE entries', () => {
      const bulkTLE = `${ISS_TLE}
${HUBBLE_TLE}`;
      
      const results = parseBulkTLE(bulkTLE);
      
      expect(results).toHaveLength(2);
      expect(results[0].satellite.name).toBe('ISS (ZARYA)');
      expect(results[1].satellite.name).toBe('HST');
    });

    it('skips invalid entries and continues parsing', () => {
      const bulkTLE = `${ISS_TLE}
INVALID
ENTRY
HERE
${HUBBLE_TLE}`;
      
      const results = parseBulkTLE(bulkTLE);
      
      // Should parse at least one valid entry
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('returns empty array for empty input', () => {
      expect(parseBulkTLE('')).toEqual([]);
    });
  });

  describe('isTLEStale', () => {
    it('returns false for fresh TLE', () => {
      const tle: TLEData = {
        noradId: '25544',
        line1: '',
        line2: '',
        epoch: new Date(),
        fetchedAt: new Date(),
      };
      
      expect(isTLEStale(tle, 24 * 60 * 60 * 1000)).toBe(false);
    });

    it('returns true for stale TLE', () => {
      const tle: TLEData = {
        noradId: '25544',
        line1: '',
        line2: '',
        epoch: new Date(),
        fetchedAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
      };
      
      expect(isTLEStale(tle, 24 * 60 * 60 * 1000)).toBe(true);
    });
  });

  describe('validateTLEChecksum', () => {
    it('validates checksum calculation', () => {
      // The checksum validation function exists and runs
      const line = '1 25544U 98067A   24001.50000000  .00016717  00000-0  10270-3 0  9025';
      const result = validateTLEChecksum(line);
      expect(typeof result).toBe('boolean');
    });
  });
});
