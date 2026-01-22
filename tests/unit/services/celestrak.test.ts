import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchByName, fetchTLE } from '../../../src/services/celestrak';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('celestrak service', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('searchByName', () => {
    it('returns empty array for empty query', async () => {
      const results = await searchByName('');
      expect(results).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns empty array for whitespace-only query', async () => {
      const results = await searchByName('   ');
      expect(results).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns satellites matching search query', async () => {
      const mockTLE = `HUBBLE SPACE TELESCOPE
1 20580U 90037B   24001.50000000  .00000000  00000-0  00000-0 0  9999
2 20580  28.4700 180.0000 0002500 270.0000  90.0000 15.00000000000000`;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockTLE),
      });

      const results = await searchByName('hubble');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('NAME=hubble'),
        expect.objectContaining({ signal: undefined })
      );
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('HUBBLE SPACE TELESCOPE');
      expect(results[0].noradId).toBe('20580');
    });

    it('returns multiple satellites for broad query', async () => {
      const mockTLE = `STARLINK-1234
1 44713U 19074A   24001.50000000  .00000000  00000-0  00000-0 0  9999
2 44713  53.0000 180.0000 0001000 270.0000  90.0000 15.00000000000000
STARLINK-1235
1 44714U 19074B   24001.50000000  .00000000  00000-0  00000-0 0  9999
2 44714  53.0000 180.0000 0001000 270.0000  90.0000 15.00000000000000`;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockTLE),
      });

      const results = await searchByName('starlink');

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('STARLINK-1234');
      expect(results[1].name).toBe('STARLINK-1235');
    });

    it('returns empty array when no satellites found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('No GP data found'),
      });

      const results = await searchByName('nonexistent');

      expect(results).toEqual([]);
    });

    it('throws error on fetch failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(searchByName('hubble')).rejects.toThrow('Search failed: 500');
    });

    it('encodes special characters in query', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('No GP data found'),
      });

      await searchByName('ISS (ZARYA)');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('NAME=ISS%20(ZARYA)'),
        expect.objectContaining({ signal: undefined })
      );
    });
  });

  describe('fetchTLE', () => {
    it('fetches TLE data for valid NORAD ID', async () => {
      const mockTLE = `ISS (ZARYA)
1 25544U 98067A   24001.50000000  .00000000  00000-0  00000-0 0  9999
2 25544  51.6400 180.0000 0007000 270.0000  90.0000 15.50000000000000`;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockTLE),
      });

      const result = await fetchTLE('25544');

      expect(result.satellite.noradId).toBe('25544');
      expect(result.satellite.name).toBe('ISS (ZARYA)');
      expect(result.tle.line1).toContain('1 25544U');
      expect(result.tle.line2).toContain('2 25544');
    });

    it('throws error for non-existent satellite', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('No GP data found'),
      });

      await expect(fetchTLE('99999')).rejects.toThrow('Satellite not found: 99999');
    });

    it('throws error on network failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(fetchTLE('25544')).rejects.toThrow('Failed to fetch TLE: 404');
    });
  });
});
