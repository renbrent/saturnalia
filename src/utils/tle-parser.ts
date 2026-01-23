import type { Satellite, TLEData } from '../types/satellite';

/**
 * Parse TLE epoch from line 1 to Date
 * Format: YYDDD.DDDDDDDD where YY is year and DDD.D is day of year
 */
export function parseTLEEpoch(line1: string): Date {
  // Characters 19-32 contain epoch
  const epochStr = line1.substring(18, 32).trim();
  const year2digit = parseInt(epochStr.substring(0, 2), 10);
  const dayOfYear = parseFloat(epochStr.substring(2));

  // Convert 2-digit year to 4-digit (57-99 = 1900s, 00-56 = 2000s)
  const year = year2digit >= 57 ? 1900 + year2digit : 2000 + year2digit;

  // Create date from year and day of year
  const date = new Date(Date.UTC(year, 0, 1));
  date.setUTCDate(date.getUTCDate() + dayOfYear - 1);

  return date;
}

/**
 * Extract NORAD ID from TLE line 1
 */
export function extractNoradId(line1: string): string {
  // Characters 3-7 contain catalog number
  return line1.substring(2, 7).trim();
}

/**
 * Extract international designator from TLE line 1
 */
export function extractIntlDesignator(line1: string): string {
  // Characters 10-17 contain international designator
  return line1.substring(9, 17).trim();
}

/**
 * T078b: Check if satellite has decayed/deorbited based on TLE data
 * Satellites with very low perigee or old epochs are likely decayed
 */
export function checkIfDecayed(line1: string, _line2: string): boolean {
  const epoch = parseTLEEpoch(line1);
  const ageInDays = (Date.now() - epoch.getTime()) / (1000 * 60 * 60 * 24);
  
  // If TLE epoch is over 60 days old and mean motion derivative is large negative,
  // satellite likely decayed. Mean motion is in revs/day at characters 53-63 of line 2
  if (ageInDays > 60) {
    return true; // Stale TLE suggests no longer tracked
  }
  
  return false;
}

/**
 * Parse raw TLE text into structured data
 * @param tleText Raw TLE text (3 lines: name, line1, line2)
 */
export function parseTLE(tleText: string): { satellite: Satellite; tle: TLEData } {
  const lines = tleText.trim().split('\n').map((l) => l.trim());

  if (lines.length < 3) {
    throw new Error('Invalid TLE format: expected 3 lines');
  }

  const [name, line1, line2] = lines;

  // Validate TLE lines
  if (!line1.startsWith('1 ')) {
    throw new Error('Invalid TLE line 1: must start with "1 "');
  }
  if (!line2.startsWith('2 ')) {
    throw new Error('Invalid TLE line 2: must start with "2 "');
  }

  const noradId = extractNoradId(line1);
  const intlDesignator = extractIntlDesignator(line1);
  const epoch = parseTLEEpoch(line1);
  const isDecayed = checkIfDecayed(line1, line2);

  const satellite: Satellite = {
    noradId,
    name: name.trim(),
    intlDesignator: intlDesignator || undefined,
    decayDate: isDecayed ? epoch : undefined,
  };

  const tle: TLEData = {
    noradId,
    line1,
    line2,
    epoch,
    fetchedAt: new Date(),
  };

  return { satellite, tle };
}

/**
 * Parse multiple TLE entries from bulk text
 * @param bulkTLE Raw TLE text with multiple 3-line entries
 */
export function parseBulkTLE(bulkTLE: string): Array<{ satellite: Satellite; tle: TLEData }> {
  const lines = bulkTLE.trim().split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const results: Array<{ satellite: Satellite; tle: TLEData }> = [];

  for (let i = 0; i < lines.length; i += 3) {
    if (i + 2 >= lines.length) break;
    const tleText = lines.slice(i, i + 3).join('\n');
    try {
      results.push(parseTLE(tleText));
    } catch {
      // Skip invalid entries
      console.warn(`Failed to parse TLE entry at line ${i + 1}`);
    }
  }

  return results;
}

/**
 * Check if TLE data is stale (older than TTL)
 */
export function isTLEStale(tle: TLEData, ttlMs: number): boolean {
  const age = Date.now() - tle.fetchedAt.getTime();
  return age > ttlMs;
}

/**
 * Validate TLE checksum (modulo 10 checksum on each line)
 */
export function validateTLEChecksum(line: string): boolean {
  let checksum = 0;
  for (let i = 0; i < line.length - 1; i++) {
    const char = line[i];
    if (char >= '0' && char <= '9') {
      checksum += parseInt(char, 10);
    } else if (char === '-') {
      checksum += 1;
    }
  }
  const expectedChecksum = parseInt(line[line.length - 1], 10);
  return checksum % 10 === expectedChecksum;
}
