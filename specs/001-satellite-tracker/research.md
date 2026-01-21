# Research: Satellite Tracker

**Feature**: 001-satellite-tracker  
**Date**: 2026-01-20  
**Purpose**: Resolve technical decisions and document best practices for implementation

## 1. Satellite Data Source

### Decision: CelesTrak

**Rationale**: CelesTrak provides free, no-authentication TLE data updated multiple times daily. It's the de facto standard for hobbyist and educational satellite tracking applications.

**Alternatives Considered**:
| Source | Pros | Cons | Verdict |
|--------|------|------|---------|
| Space-Track.org | Official NORAD source, comprehensive | Requires account, rate limits, overkill for MVP | Rejected |
| N2YO API | Pre-calculated positions, simple API | API key required, rate limits, external dependency | Rejected |
| CelesTrak | Free, no auth, reliable, direct TLE access | TLE requires client-side calculation | ✅ Selected |

**Key Endpoints**:
```
# Single satellite by NORAD ID
https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE

# Search by name (partial match)
https://celestrak.org/NORAD/elements/gp.php?NAME=HUBBLE&FORMAT=TLE

# Bulk: Active satellites (~5000)
https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=TLE

# Bulk: Stations (ISS, CSS, etc.)
https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=TLE
```

**Caching Strategy**:
- Cache TLE data in localStorage with 24-hour TTL
- Fetch fresh TLE on app load if cache expired
- Allow manual refresh button for users

---

## 2. Orbital Propagation Library

### Decision: satellite.js

**Rationale**: Mature, well-maintained JavaScript library implementing SGP4/SDP4 propagation algorithms. Used by NASA and major satellite tracking applications. Small bundle size (~20KB minified).

**Alternatives Considered**:
| Library | Pros | Cons | Verdict |
|---------|------|------|---------|
| satellite.js | Battle-tested, TypeScript types, small | None significant | ✅ Selected |
| tle.js | Simpler API | Less maintained, fewer features | Rejected |
| Server-side calculation | Offload computation | Requires backend, latency | Rejected |

**Key Functions**:
```typescript
import { twoline2satrec, propagate, gstime, eciToGeodetic } from 'satellite.js';

// Parse TLE to satellite record
const satrec = twoline2satrec(tleLine1, tleLine2);

// Propagate to current time
const positionAndVelocity = propagate(satrec, new Date());

// Convert ECI to lat/lng/alt
const gmst = gstime(new Date());
const geodetic = eciToGeodetic(positionAndVelocity.position, gmst);
```

---

## 3. Map Library Stack

### Decision: React Map GL + MapLibre GL JS + MapTiler

**Rationale**: React Map GL provides React bindings for MapLibre GL JS (open-source Mapbox GL fork). MapTiler provides free tier with 100k requests/month, sufficient for development and small-scale production.

**Alternatives Considered**:
| Stack | Pros | Cons | Verdict |
|-------|------|------|---------|
| Leaflet + React-Leaflet | Simpler, more tutorials | Less performant for real-time updates | Rejected |
| Mapbox GL JS | Best performance, features | Expensive, proprietary | Rejected |
| MapLibre + MapTiler | Free, performant, open-source | Slightly less documentation | ✅ Selected |
| Cesium | 3D globe, realistic | Overkill, large bundle, complex | Rejected |

**MapTiler Setup**:
- Free tier: 100,000 map loads/month
- API key stored in environment variable: `VITE_MAPTILER_API_KEY`
- Style URL: `https://api.maptiler.com/maps/streets-v2/style.json?key={key}`

**Performance Considerations**:
- Use `requestAnimationFrame` for smooth marker updates
- Batch position updates to reduce re-renders
- Limit visible satellites to viewport + buffer zone

---

## 4. Pass Prediction Algorithm

### Decision: satellite.js built-in propagation + custom visibility logic

**Rationale**: satellite.js can propagate satellite positions to any future time. We calculate passes by:
1. Propagating position every minute for 7 days
2. Checking if satellite is above observer's horizon (elevation > 10°)
3. Grouping consecutive above-horizon points into "passes"

**Implementation Approach**:
```typescript
interface PassPrediction {
  startTime: Date;
  endTime: Date;
  maxElevation: number;      // degrees
  maxElevationTime: Date;
  startAzimuth: number;      // degrees (compass direction)
  endAzimuth: number;
  duration: number;          // seconds
}

function calculatePasses(
  satrec: SatRec,
  observer: { lat: number; lng: number; altitude: number },
  startDate: Date,
  days: number = 7
): PassPrediction[]
```

**Observer Location**:
- Primary: Browser Geolocation API
- Fallback: Manual coordinates entry
- Fallback: Nominatim geocoding for city name search

---

## 5. Geocoding for Manual Location Entry

### Decision: Nominatim (OpenStreetMap)

**Rationale**: Free, no API key required, sufficient for occasional city lookups. Users primarily use device GPS; geocoding is fallback only.

**Alternatives Considered**:
| Service | Pros | Cons | Verdict |
|---------|------|------|---------|
| Nominatim | Free, no auth, OSM data | Rate limits (1 req/sec) | ✅ Selected |
| MapTiler Geocoding | Already have account | Costs against quota | Rejected |
| Google Geocoding | Accurate | Requires billing, overkill | Rejected |

**Usage Pattern**:
```typescript
// Nominatim search
const response = await fetch(
  `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
  { headers: { 'User-Agent': 'Saturnalia/1.0' } }
);
```

---

## 6. State Management

### Decision: React Context + useReducer for global state, useState for local

**Rationale**: App state is relatively simple (current satellite, favorites, user location). No need for Redux or Zustand complexity.

**Alternatives Considered**:
| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| Redux Toolkit | Powerful, devtools | Overkill for this scope | Rejected |
| Zustand | Simple, small | Extra dependency | Rejected |
| Jotai | Atomic, modern | Learning curve | Rejected |
| Context + useReducer | Built-in, sufficient, familiar | Prop drilling if deep | ✅ Selected |

**State Shape**:
```typescript
interface AppState {
  currentSatellite: Satellite | null;
  favorites: string[];           // NORAD IDs
  userLocation: UserLocation | null;
  tleCache: Map<string, TLEData>;
  isLoading: boolean;
  error: string | null;
}
```

---

## 7. Responsive Design System

### Decision: Tailwind CSS with custom design tokens

**Rationale**: Tailwind provides utility-first CSS with built-in responsive breakpoints matching Constitution requirements. Design tokens ensure consistency.

**Breakpoints** (matching Constitution I):
```typescript
// tailwind.config.ts
{
  theme: {
    screens: {
      'sm': '640px',   // Mobile landscape
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Large desktop
      '2xl': '1536px', // Extra large
    }
  }
}
```

**Touch Target Enforcement**:
- All interactive elements: `min-h-[44px] min-w-[44px]` on mobile
- Use `@apply` for consistent button/link styles

---

## 8. Testing Strategy

### Decision: Vitest + React Testing Library + Playwright

**Rationale**: Vitest is fast and Vite-native. RTL for component testing. Playwright for E2E flows.

**Test Priorities** (per Constitution IV):
| Area | Type | Coverage Target |
|------|------|-----------------|
| satellite.ts service | Unit | ≥90% |
| passes.ts service | Unit | ≥90% |
| TLE parsing | Unit | ≥95% |
| SatelliteMap component | Component | Visual + interaction |
| Search flow | E2E | Happy path + no results |
| Favorites flow | E2E | Add/remove/persist |
| Pass prediction flow | E2E | With/without location |

---

## 9. Performance Optimizations

### Decisions:
1. **Code splitting**: Lazy load pass prediction modal (heavy calculation)
2. **Web Workers**: Move satellite propagation to worker if >10 satellites tracked
3. **Memoization**: `useMemo` for derived satellite data, `useCallback` for handlers
4. **Virtualization**: Not needed for MVP (only showing favorites, typically <20)

---

## 10. Offline Support

### Decision: Service Worker with Workbox (via vite-plugin-pwa)

**Rationale**: Cache TLE data and map tiles for offline viewing of last-known positions.

**Caching Strategy**:
- **App shell**: Cache-first (HTML, JS, CSS)
- **TLE data**: Network-first with localStorage fallback
- **Map tiles**: Cache-first with network fallback (MapTiler caching headers)

---

## Summary of Technical Decisions

| Decision Area | Choice | Key Reason |
|---------------|--------|------------|
| Satellite Data | CelesTrak | Free, no auth, reliable |
| Orbital Math | satellite.js | Battle-tested, TypeScript support |
| Maps | React Map GL + MapLibre + MapTiler | Open source, performant, free tier |
| Geocoding | Nominatim | Free, no auth, sufficient for fallback |
| State Management | Context + useReducer | Built-in, simple, sufficient |
| Styling | Tailwind CSS | Utility-first, responsive, design tokens |
| Testing | Vitest + RTL + Playwright | Fast, Vite-native, comprehensive |
| Offline | vite-plugin-pwa | Service worker with minimal config |
