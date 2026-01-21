# Data Model: Satellite Tracker

**Feature**: 001-satellite-tracker  
**Date**: 2026-01-20  
**Source**: [spec.md](spec.md) Key Entities + [research.md](research.md) Technical Decisions

## Entity Relationship Diagram

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│    Satellite    │      │     TLEData     │      │   SatellitePos  │
├─────────────────┤      ├─────────────────┤      ├─────────────────┤
│ noradId (PK)    │──1:1─│ noradId (FK)    │      │ latitude        │
│ name            │      │ line1           │      │ longitude       │
│ intlDesignator  │      │ line2           │      │ altitude        │
│ launchDate      │      │ epoch           │      │ velocity        │
│ decayDate?      │      │ fetchedAt       │      │ timestamp       │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                                          │
                                                          │ calculated from
                                                          ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  UserLocation   │      │ PassPrediction  │◄─────│    Observer     │
├─────────────────┤      ├─────────────────┤      ├─────────────────┤
│ latitude        │      │ satelliteId     │      │ latitude        │
│ longitude       │      │ startTime       │      │ longitude       │
│ altitude        │      │ endTime         │      │ altitude        │
│ source          │      │ maxElevation    │      │ (derived from   │
│ timestamp       │      │ maxElevationTime│      │  UserLocation)  │
└─────────────────┘      │ startAzimuth    │      └─────────────────┘
                         │ endAzimuth      │
                         │ duration        │
                         └─────────────────┘

┌─────────────────┐
│    Favorite     │
├─────────────────┤
│ noradId (PK)    │
│ addedAt         │
└─────────────────┘
```

## Core Entities

### Satellite

Represents a cataloged artificial satellite from the NORAD catalog.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `noradId` | string | ✓ | NORAD catalog number (e.g., "25544" for ISS) |
| `name` | string | ✓ | Common name (e.g., "ISS (ZARYA)") |
| `intlDesignator` | string | | International designator (e.g., "1998-067A") |
| `launchDate` | Date | | Launch date if known |
| `decayDate` | Date | | Decay/reentry date if applicable |

**Validation Rules**:
- `noradId` must be 1-9 digits
- `name` must be non-empty, max 100 characters

**Source**: Parsed from TLE data line 0 (name) and line 1 (NORAD ID, designator)

---

### TLEData

Two-Line Element set containing orbital parameters for propagation.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `noradId` | string | ✓ | Foreign key to Satellite |
| `line1` | string | ✓ | TLE line 1 (69 characters) |
| `line2` | string | ✓ | TLE line 2 (69 characters) |
| `epoch` | Date | ✓ | TLE epoch (derived from line 1) |
| `fetchedAt` | Date | ✓ | When TLE was fetched from CelesTrak |

**Validation Rules**:
- `line1` must start with "1 " and be exactly 69 characters
- `line2` must start with "2 " and be exactly 69 characters
- `epoch` must be within 30 days of current date for accurate propagation

**State Transitions**:
- Fresh → Stale (after 24 hours)
- Stale → Fresh (after re-fetch)

---

### SatellitePosition

Calculated position of a satellite at a specific time.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `latitude` | number | ✓ | Degrees (-90 to 90) |
| `longitude` | number | ✓ | Degrees (-180 to 180) |
| `altitude` | number | ✓ | Kilometers above Earth's surface |
| `velocity` | number | ✓ | Kilometers per second |
| `timestamp` | Date | ✓ | Time of this position |

**Validation Rules**:
- `latitude` must be between -90 and 90
- `longitude` must be between -180 and 180
- `altitude` must be positive (typically 200-40000 km for active satellites)
- `velocity` must be positive (typically 3-8 km/s)

**Derived From**: TLEData via satellite.js SGP4 propagation

---

### UserLocation

Geographic location of the user for pass predictions.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `latitude` | number | ✓ | Degrees (-90 to 90) |
| `longitude` | number | ✓ | Degrees (-180 to 180) |
| `altitude` | number | | Meters above sea level (default: 0) |
| `source` | enum | ✓ | "gps" \| "manual" \| "geocoded" |
| `timestamp` | Date | ✓ | When location was obtained |
| `displayName` | string | | Human-readable name (city, address) |

**Validation Rules**:
- Same as SatellitePosition for lat/lng
- `altitude` must be between -500 and 10000 meters
- `source` determines trust level for accuracy display

---

### PassPrediction

A predicted satellite pass over the user's location.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `satelliteId` | string | ✓ | NORAD ID of the satellite |
| `startTime` | Date | ✓ | When satellite rises above horizon |
| `endTime` | Date | ✓ | When satellite sets below horizon |
| `maxElevation` | number | ✓ | Peak elevation in degrees (0-90) |
| `maxElevationTime` | Date | ✓ | Time of peak elevation |
| `startAzimuth` | number | ✓ | Compass direction at rise (0-360) |
| `endAzimuth` | number | ✓ | Compass direction at set (0-360) |
| `duration` | number | ✓ | Pass duration in seconds |

**Validation Rules**:
- `maxElevation` must be >= 10 (minimum observable elevation)
- `duration` must be positive
- `startTime` must be before `endTime`
- Azimuth values must be between 0 and 360

**Derived From**: UserLocation + TLEData via iterative propagation

---

### Favorite

User's saved satellite for quick access.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `noradId` | string | ✓ | NORAD ID of favorited satellite |
| `addedAt` | Date | ✓ | When user added to favorites |

**Storage**: Browser localStorage as JSON array

**Validation Rules**:
- `noradId` must reference a valid satellite
- Duplicate `noradId` entries not allowed

---

## Application State

### AppState

Root state shape for React Context.

| Field | Type | Description |
|-------|------|-------------|
| `currentSatellite` | Satellite \| null | Currently tracked satellite |
| `currentPosition` | SatellitePosition \| null | Latest calculated position |
| `favorites` | Favorite[] | User's saved satellites |
| `userLocation` | UserLocation \| null | User's location for passes |
| `tleCache` | Map<string, TLEData> | Cached TLE data by NORAD ID |
| `searchResults` | Satellite[] | Current search results |
| `passes` | PassPrediction[] | Calculated passes for current satellite |
| `isLoading` | boolean | Global loading state |
| `error` | AppError \| null | Current error if any |

### AppError

| Field | Type | Description |
|-------|------|-------------|
| `code` | string | Error code (e.g., "TLE_FETCH_FAILED") |
| `message` | string | User-friendly error message |
| `details` | unknown | Technical details for logging |

---

## Storage Schema

### localStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `saturnalia:favorites` | Favorite[] | User's favorite satellites |
| `saturnalia:tle-cache` | Record<string, TLEData> | Cached TLE data |
| `saturnalia:user-location` | UserLocation | Last known user location |
| `saturnalia:last-satellite` | string | NORAD ID of last viewed satellite |

### Cache Expiration

| Data | TTL | Refresh Strategy |
|------|-----|------------------|
| TLE data | 24 hours | Background refresh on app load |
| User location | Session | Re-request if source is "gps" |
| Search results | None | Not cached, always fresh |
| Pass predictions | 1 hour | Recalculate if TLE updated |
