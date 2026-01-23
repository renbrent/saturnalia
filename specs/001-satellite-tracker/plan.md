# Implementation Plan: Satellite Tracker

**Branch**: `001-satellite-tracker` | **Date**: 2026-01-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-satellite-tracker/spec.md`

## Summary

Build a responsive web application that displays real-time satellite positions on an interactive world map. The app defaults to tracking the International Space Station, allows users to search and favorite satellites, and predicts when satellites will be visible from the user's location. Satellite positions are calculated client-side using TLE data from CelesTrak and the satellite.js library.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: React 19, Vite 7, Tailwind CSS 4, React Map GL, MapLibre GL JS, satellite.js  
**Storage**: Browser localStorage (favorites, cached TLE data)  
**Testing**: Vitest (unit), Playwright (E2E), React Testing Library (components)  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions), mobile & desktop  
**Project Type**: Single (frontend-only SPA)  
**Performance Goals**: FCP < 1.5s on 3G; LCP < 2.5s; satellite position updates at 10Hz minimum  
**Constraints**: Bundle size < 500KB gzipped; works offline after initial TLE fetch; no backend required  
**Scale/Scope**: ~10,000 trackable satellites; single-user local storage; 5 core screens/views

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Responsive-First Design | ✅ PASS | Mobile-first with Tailwind breakpoints; touch targets enforced; performance budgets defined |
| II. Security-First API Design | ✅ PASS | No custom API (uses public CelesTrak); CORS handled by external service; no auth required for MVP |
| III. UX/UI Design Standards | ✅ PASS | WCAG 2.1 AA compliance planned; Tailwind design system; keyboard navigation required |
| IV. Test-Driven Quality | ✅ PASS | Vitest for units, Playwright for E2E, component tests for critical paths |
| V. Simplicity & Maintainability | ✅ PASS | Client-side only; minimal dependencies; satellite.js is mature and small |
| VI. Git Standards | ✅ PASS | Conventional commits; feature branch workflow; .gitignore for env files |

**Gate Result**: ✅ PASS - No violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-satellite-tracker/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (TypeScript interfaces)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/          # React UI components
│   ├── map/            # Map-related components (SatelliteMap, SatelliteMarker, GroundTrack)
│   ├── search/         # Search components (SearchBar, SearchResults)
│   ├── satellite/      # Satellite info components (SatelliteCard, SatelliteDetails)
│   ├── favorites/      # Favorites components (FavoritesList, FavoriteButton)
│   ├── passes/         # Pass prediction components (PassList, PassCard, LocationPicker, PassPredictionModal)
│   └── ui/             # Shared UI primitives (Button, Input, Modal, Loading, OfflineIndicator)
├── context/            # React Context providers
│   └── AppContext.tsx  # Global state provider (useReducer-based)
├── hooks/              # Custom React hooks
│   ├── useSatellitePosition.ts
│   ├── useTLEData.ts
│   ├── useFavorites.ts
│   ├── useUserLocation.ts
│   └── usePassPredictions.ts
├── services/           # Business logic and external integrations
│   ├── celestrak.ts    # TLE data fetching from CelesTrak
│   ├── geocoding.ts    # Nominatim geocoding for location search
│   ├── satellite.ts    # Wrapper around satellite.js for position calculations
│   ├── passes.ts       # Pass prediction calculations
│   └── storage.ts      # localStorage abstraction for favorites/cache
├── types/              # TypeScript type definitions
│   ├── satellite.ts    # Satellite, TLE, Position types
│   ├── pass.ts         # PassPrediction types
│   └── location.ts     # UserLocation types
├── utils/              # Pure utility functions
│   ├── tle-parser.ts   # TLE string parsing
│   ├── coordinates.ts  # Coordinate transformations
│   └── time.ts         # Time/date utilities
├── constants/          # Application constants
│   └── index.ts        # ISS NORAD ID, API URLs, default settings
├── App.tsx             # Root component
├── main.tsx            # Entry point
└── index.css           # Tailwind imports and global styles

tests/
├── unit/               # Vitest unit tests
│   ├── services/
│   └── utils/
├── component/          # React Testing Library component tests
│   └── components/
└── e2e/                # Playwright E2E tests
    └── flows/

public/
├── favicon.svg
└── satellite-icon.svg
```


**Structure Decision**: Single project (frontend SPA). No backend needed since satellite position calculations are done client-side with satellite.js and TLE data is fetched directly from CelesTrak's public API.

## Complexity Tracking

> No violations to justify. Constitution check passed without exceptions.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | - | - |
