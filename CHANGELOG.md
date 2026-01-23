# Changelog

All notable changes to Saturnalia will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-22

### 🎉 First Stable Release

Complete implementation of all 4 user stories with full accessibility compliance and performance optimization.

### Added

**Phase 7: Final Polish**
- **Loading Skeletons**: Visual feedback for map, satellite cards, favorites, and pass predictions during loading
- **Offline Support**: Network status detection with offline indicator banner
- **Decayed Satellite Detection**: Warning messages for satellites with stale TLE data (>60 days old)
- **WCAG 2.1 AA Accessibility**: Complete keyboard navigation and ARIA labels across all components
- **Performance Optimization**: Bundle size optimized to 381KB gzipped (under 500KB target)

**Phase 6: Pass Predictions (User Story 4)**
- Pass prediction calculator with azimuth, elevation, and duration
- Location picker with GPS and manual search (Nominatim geocoding)
- Visual indicators for pass quality (excellent/good/fair based on elevation)
- Upcoming pass highlighting
- 7-day lookahead with configurable minimum elevation

**Phase 5: Favorites (User Story 3)**
- Favorite/unfavorite satellites with localStorage persistence
- Favorites sidebar with active satellite highlighting
- Quick access to saved satellites

### Technical

**Infrastructure**
- Constitution compliance: 6/6 core principles met
- Test coverage: E2E tests for all user flows
- Code quality: ESLint clean, all unused imports removed
- Bundle analysis: 381KB gzipped (94KB app JS, 15KB CSS, 273KB MapLibre)
- Documentation: Quickstart validated, performance audit complete

**All Tasks Complete**: 85/85 (100%)

### Changed
- Updated FR-005 specification to reflect actual orbital parameters displayed
- Updated project structure documentation to match implementation

### Fixed
- ESLint errors: Removed unused imports, fixed type annotations
- React hooks warnings: Proper dependency arrays
- TypeScript strict mode compliance

## [0.4.0] - 2026-01-22

### Added
- Offline indicator and cached data messaging (T078)
- Decayed satellite detection and warnings (T078b)
- Comprehensive WCAG 2.1 AA accessibility audit (T081)
- Meta tags and favicon verification (T082)
- Performance audit and bundle size analysis (T083)

### Technical
- Constitution compliance: All 6 principles validated
- Performance budget: 381KB gzipped < 500KB target ✅
- Accessibility: Keyboard navigation, ARIA labels, focus indicators

## [0.3.0] - 2026-01-21

### Added
- **Pass Predictions**: Calculate when satellites will be visible from user location (User Story 4)
- Location picker with GPS and manual geocoding
- Pass prediction modal with 7-day lookahead
- Visual pass quality indicators
- **Favorites**: Save and quickly access favorite satellites (User Story 3)
- Favorites sidebar with persistence

## [0.2.0] - 2026-01-21

### Added
- **Satellite Search**: Search for any satellite by name with debounced autocomplete (User Story 2)
- Search results dropdown with keyboard navigation (arrow keys, enter to select)
- "No results found" empty state with helpful suggestions
- Error handling with user-visible error messages for API failures
- Race condition prevention using AbortController for search requests

### Changed
- Updated specification docs to reflect React 19, Vite 7, Tailwind CSS 4

### Fixed
- Search race conditions causing stale results to appear
- Input validation with maxLength to prevent excessively long queries

## [0.1.0] - 2026-01-20

### Added
- **ISS Tracking**: Real-time International Space Station position on interactive world map (User Story 1)
- MapLibre GL map with OpenStreetMap tiles (no API key required)
- Satellite marker with position updates every second
- Ground track visualization showing orbital path
- Satellite info card displaying name, altitude, velocity, and orbital period
- TLE data caching with 24-hour expiry
- Responsive layout (mobile fullscreen map, desktop with sidebar)
- Loading and error states for data fetching
- GitHub Pages deployment via GitHub Actions

### Technical
- React 19 + TypeScript + Vite 7 project structure
- Tailwind CSS 4 for styling
- satellite.js for SGP4 orbital propagation
- Vitest + React Testing Library for unit/component tests
- Playwright for E2E tests
- 60 passing tests

[1.0.0]: https://github.com/renbrent/saturnalia/compare/v0.4.0...v1.0.0
[0.4.0]: https://github.com/renbrent/saturnalia/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/renbrent/saturnalia/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/renbrent/saturnalia/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/renbrent/saturnalia/releases/tag/v0.1.0
