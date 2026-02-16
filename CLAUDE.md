# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Saturnalia is a real-time satellite tracking web application built with React 19 + TypeScript + Vite. It displays satellite positions on an interactive map using TLE (Two-Line Element) data from CelesTrak and the satellite.js SGP4 propagator for orbital calculations.

## Development Commands

```bash
# Development
npm run dev              # Start dev server at http://localhost:5173
npm run build            # Type-check and build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run unit tests in watch mode
npm run test:run         # Run unit tests once
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run Playwright E2E tests (requires dev server)

# Code Quality
npm run lint             # Lint with ESLint
npm run format           # Format with Prettier
npm run format:check     # Check formatting
```

## Architecture

### State Management

**AppContext** (`src/context/AppContext.tsx`) provides global state using React Context + useReducer:
- Manages favorites, TLE cache, user location, search results, pass predictions
- Persists favorites and TLE cache to localStorage on change
- Loads persisted data on mount
- Use `useApp()` hook to access state and actions

### Data Flow

1. **TLE Fetching**: `useTLEData` hook fetches TLE data from CelesTrak API
2. **Position Calculation**: `useSatellitePosition` hook uses satellite.js to calculate position from TLE
3. **Real-time Updates**: Position recalculated every second (configurable via `POSITION_UPDATE_INTERVAL`)
4. **Caching**: TLE data cached in context and localStorage with 24h TTL

### Service Layer

Services are stateless functions that handle external APIs and calculations:

- **celestrak.ts**: CelesTrak API client (fetch TLE, search satellites)
- **satellite.ts**: Orbital mechanics (SGP4 propagation, ground tracks, orbital parameters)
- **passes.ts**: Pass prediction calculations (when satellite is visible from location)
- **geocoding.ts**: Reverse geocoding for location names
- **storage.ts**: localStorage persistence (favorites, TLE cache, user location)

### Custom Hooks Pattern

Hooks encapsulate stateful logic and are the primary way to interact with services:

- **useTLEData**: Fetches TLE for a satellite, handles caching and errors
- **useSatellitePosition**: Calculates real-time position, updates every second
- **useFavorites**: Manages favorite satellites (add/remove/list)
- **usePassPredictions**: Calculates upcoming visible passes for a location
- **useUserLocation**: Gets and persists user's geographic location
- **useNetworkStatus**: Detects online/offline status

### Component Organization

Components are organized by feature domain:

- **map/**: MapLibre map components (SatelliteMap, GroundTrack, SatelliteMarker)
- **satellite/**: Satellite info displays (SatelliteCard, SatelliteDetails)
- **search/**: Search UI (SearchBar, SearchResults)
- **favorites/**: Favorites management (FavoriteButton, FavoritesList)
- **passes/**: Pass predictions (PassList, PassCard, LocationPicker, PassPredictionModal)
- **ui/**: Reusable UI primitives (Button, Modal, Loading, ErrorMessage)

### Testing Structure

- **Unit tests** (`tests/unit/`): Test services and utilities in isolation
- **Component tests** (`tests/component/`): Test React components with React Testing Library
- **E2E tests** (`tests/e2e/`): Test user flows with Playwright

## Key Patterns

### TLE Data

Two-Line Element (TLE) sets are the NASA/NORAD standard format for satellite orbital elements. Each TLE contains:
- Line 1: Satellite number, epoch, ballistic coefficient, etc.
- Line 2: Inclination, eccentricity, mean motion, etc.

TLEs are parsed in `utils/tle-parser.ts` and used by satellite.js for SGP4 propagation.

### Satellite Position Updates

Position updates happen via `useSatellitePosition` hook:
1. Accepts TLE data and update interval
2. Calculates initial position immediately
3. Sets up interval to recalculate position (default 1 second)
4. Cleans up interval on unmount or TLE change
5. Ground track calculated once per TLE (not every position update)

### Offline Support

- TLE data cached in localStorage with timestamps
- Cached data used when offline (via `useNetworkStatus` + cache fallback)
- `OfflineIndicator` component shows when offline
- Last viewed satellite persisted and restored on reload

### Error Handling

Errors flow through AppContext:
1. Hooks/services throw errors
2. Component catches and calls `setError()`
3. Error displayed in `ErrorMessage` banner
4. User can dismiss via `clearError()`

## Important Constants

- **ISS_NORAD_ID**: "25544" - Default satellite on launch
- **POSITION_UPDATE_INTERVAL**: 1000ms - How often to recalculate position
- **TLE_CACHE_TTL**: 24 hours - How long cached TLE data is valid
- **MIN_PASS_ELEVATION**: 10° - Minimum elevation for visible pass
