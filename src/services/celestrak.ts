import type { Satellite, TLEData } from '../types/satellite';
import { CELESTRAK_BASE_URL } from '../constants';
import { parseTLE, parseBulkTLE } from '../utils/tle-parser';

/**
 * Fetch TLE data for a single satellite by NORAD ID
 */
export async function fetchTLE(noradId: string): Promise<{ satellite: Satellite; tle: TLEData }> {
  const url = `${CELESTRAK_BASE_URL}?CATNR=${noradId}&FORMAT=TLE`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch TLE: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  if (!text.trim() || text.includes('No GP data found')) {
    throw new Error(`Satellite not found: ${noradId}`);
  }

  return parseTLE(text);
}

/**
 * Search satellites by name (partial match)
 */
export async function searchByName(query: string): Promise<Satellite[]> {
  if (!query.trim()) {
    return [];
  }

  // CelesTrak name search - returns TLE format
  const url = `${CELESTRAK_BASE_URL}?NAME=${encodeURIComponent(query)}&FORMAT=TLE`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Search failed: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  if (!text.trim() || text.includes('No GP data found')) {
    return [];
  }

  const results = parseBulkTLE(text);
  return results.map((r) => r.satellite);
}

/**
 * Fetch TLE for multiple satellites by NORAD IDs
 */
export async function fetchBulkTLE(noradIds: string[]): Promise<Array<{ satellite: Satellite; tle: TLEData }>> {
  if (noradIds.length === 0) {
    return [];
  }

  // For small lists, fetch individually in parallel
  if (noradIds.length <= 5) {
    const promises = noradIds.map((id) => fetchTLE(id).catch(() => null));
    const results = await Promise.all(promises);
    return results.filter((r): r is { satellite: Satellite; tle: TLEData } => r !== null);
  }

  // For larger lists, use the stations group which includes most popular satellites
  const url = `${CELESTRAK_BASE_URL}?GROUP=stations&FORMAT=TLE`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Bulk fetch failed: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  const allResults = parseBulkTLE(text);

  // Filter to only requested IDs
  const requestedSet = new Set(noradIds);
  return allResults.filter((r) => requestedSet.has(r.satellite.noradId));
}

/**
 * Fetch TLE for all active satellites (for search index)
 * Warning: This returns ~5000 satellites
 */
export async function fetchActiveSatellites(): Promise<Satellite[]> {
  const url = `${CELESTRAK_BASE_URL}?GROUP=active&FORMAT=TLE`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch active satellites: ${response.status}`);
  }

  const text = await response.text();
  const results = parseBulkTLE(text);
  return results.map((r) => r.satellite);
}
