/**
 * Format a Date as ISO string without milliseconds
 */
export function formatISO(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Format a Date as local time string (HH:MM:SS)
 */
export function formatLocalTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format a Date as local date string (YYYY-MM-DD)
 */
export function formatLocalDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format a Date as local date and time
 */
export function formatLocalDateTime(date: Date): string {
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) {
    return `${secs}s`;
  }
  return `${mins}m ${secs}s`;
}

/**
 * Format relative time (e.g., "in 2 hours", "3 days ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const isFuture = diffMs > 0;
  const absHours = Math.abs(diffHours);
  const absMins = Math.abs(diffMins);
  const absDays = Math.abs(diffDays);

  if (absDays > 0) {
    return isFuture ? `in ${absDays} day${absDays > 1 ? 's' : ''}` : `${absDays} day${absDays > 1 ? 's' : ''} ago`;
  }
  if (absHours > 0) {
    return isFuture ? `in ${absHours} hour${absHours > 1 ? 's' : ''}` : `${absHours} hour${absHours > 1 ? 's' : ''} ago`;
  }
  if (absMins > 0) {
    return isFuture ? `in ${absMins} minute${absMins > 1 ? 's' : ''}` : `${absMins} minute${absMins > 1 ? 's' : ''} ago`;
  }
  return isFuture ? 'in a moment' : 'just now';
}

/**
 * Add milliseconds to a Date
 */
export function addMilliseconds(date: Date, ms: number): Date {
  return new Date(date.getTime() + ms);
}

/**
 * Add seconds to a Date
 */
export function addSeconds(date: Date, seconds: number): Date {
  return addMilliseconds(date, seconds * 1000);
}

/**
 * Add minutes to a Date
 */
export function addMinutes(date: Date, minutes: number): Date {
  return addSeconds(date, minutes * 60);
}

/**
 * Add hours to a Date
 */
export function addHours(date: Date, hours: number): Date {
  return addMinutes(date, hours * 60);
}

/**
 * Add days to a Date
 */
export function addDays(date: Date, days: number): Date {
  return addHours(date, days * 24);
}

/**
 * Check if a date is within the next N hours
 */
export function isWithinHours(date: Date, hours: number): boolean {
  const now = new Date();
  const future = addHours(now, hours);
  return date >= now && date <= future;
}
