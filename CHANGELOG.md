# Changelog

All notable changes to Saturnalia will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.2.0]: https://github.com/renbrent/saturnalia/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/renbrent/saturnalia/releases/tag/v0.1.0
