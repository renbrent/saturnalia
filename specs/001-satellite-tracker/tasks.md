# Tasks: Satellite Tracker

**Input**: Design documents from `/specs/001-satellite-tracker/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Tests are included per Constitution IV (Test-Driven Quality) for critical paths.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root (per plan.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization with Vite, React, TypeScript, and Tailwind

- [X] T001 Initialize Vite project with React-TS template in repository root
- [X] T002 Install core dependencies: react-map-gl, maplibre-gl, satellite.js, tailwindcss
- [X] T003 [P] Configure Tailwind CSS with breakpoints in tailwind.config.ts
- [X] T004 [P] Configure Vitest in vitest.config.ts with jsdom environment
- [X] T005 [P] Configure Playwright in playwright.config.ts for E2E tests
- [X] T006 [P] Configure ESLint and Prettier in .eslintrc.json and .prettierrc
- [X] T007 Create directory structure per plan.md (src/components, src/hooks, src/services, etc.)
- [X] T008 [P] Create environment configuration with .env.local (OSM tiles used - no API key required)
- [X] T009 [P] Add .gitignore with standard Vite/Node ignores and .env.local

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Type Definitions

- [X] T010 [P] Create Satellite and TLEData types in src/types/satellite.ts
- [X] T011 [P] Create SatellitePosition and TrackedSatellite types in src/types/satellite.ts
- [X] T012 [P] Create UserLocation and LocationSource types in src/types/location.ts
- [X] T013 [P] Create PassPrediction, Observer, PassPredictionOptions types in src/types/pass.ts
- [X] T014 [P] Create AppState, AppError, Favorite types in src/types/state.ts

### Constants

- [X] T015 Create application constants in src/constants/index.ts (ISS_NORAD_ID, CELESTRAK_BASE_URL, STORAGE_KEYS)

### Core Services

- [X] T016 Implement TLE parser utility in src/utils/tle-parser.ts
- [X] T017 Implement coordinate transformation utilities in src/utils/coordinates.ts
- [X] T018 [P] Implement time utilities in src/utils/time.ts
- [X] T019 Implement CelesTrak service (fetchTLE, searchByName) in src/services/celestrak.ts
- [X] T020 Implement satellite position calculation service in src/services/satellite.ts
- [X] T021 Implement localStorage service in src/services/storage.ts

### State Management

- [X] T022 Create AppContext with useReducer in src/context/AppContext.tsx
- [X] T023 Define reducer actions and initial state in src/context/AppContext.tsx

### Shared UI Components

- [X] T024 [P] Create Button component in src/components/ui/Button.tsx
- [X] T025 [P] Create Input component in src/components/ui/Input.tsx
- [X] T026 [P] Create Loading spinner component in src/components/ui/Loading.tsx
- [X] T027 [P] Create Modal component in src/components/ui/Modal.tsx
- [X] T028 [P] Create ErrorMessage component in src/components/ui/ErrorMessage.tsx

### Unit Tests for Core Services

- [X] T029 [P] Write unit tests for TLE parser in tests/unit/utils/tle-parser.test.ts
- [X] T030 [P] Write unit tests for satellite service in tests/unit/services/satellite.test.ts
- [X] T031 [P] Write unit tests for storage service in tests/unit/services/storage.test.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View ISS Position on App Launch (Priority: P1) 🎯 MVP

**Goal**: Display ISS position on world map immediately when app opens, updating in real-time

**Independent Test**: Open app → ISS appears on map → position updates every 10 seconds → click marker shows info

### Tests for User Story 1

- [X] T032 [P] [US1] E2E test: app loads and displays ISS on map in tests/e2e/flows/iss-view.spec.ts
- [X] T033 [P] [US1] Component test: SatelliteMap renders marker at position in tests/component/components/SatelliteMap.test.tsx

### Implementation for User Story 1

- [X] T034 [P] [US1] Create SatelliteMap component with MapLibre in src/components/map/SatelliteMap.tsx
- [X] T035 [P] [US1] Create SatelliteMarker component in src/components/map/SatelliteMarker.tsx
- [X] T036 [US1] Create GroundTrack component for orbital path in src/components/map/GroundTrack.tsx
- [X] T037 [US1] Implement useTLEData hook for fetching/caching TLE in src/hooks/useTLEData.ts
- [X] T037b [US1] Add TLE cache expiry check (refetch if >24h old) in src/hooks/useTLEData.ts
- [X] T038 [US1] Implement useSatellitePosition hook with 1s update interval in src/hooks/useSatellitePosition.ts
- [X] T039 [P] [US1] Create SatelliteCard component for info display in src/components/satellite/SatelliteCard.tsx
- [X] T040 [P] [US1] Create SatelliteDetails popup component in src/components/satellite/SatelliteDetails.tsx
- [X] T041 [US1] Integrate components in App.tsx with ISS as default satellite
- [X] T042 [US1] Add responsive layout (mobile map fullscreen, desktop with sidebar) in src/App.tsx
- [X] T043 [US1] Add loading and error states for TLE fetch in App.tsx

**Checkpoint**: User Story 1 complete - ISS tracking works independently

---

## Phase 4: User Story 2 - Search and Select Satellites (Priority: P2)

**Goal**: Search satellite catalog by name and switch tracking to selected satellite

**Independent Test**: Type in search → results appear → select satellite → map tracks new satellite

### Tests for User Story 2

- [X] T044 [P] [US2] E2E test: search for Hubble and select it in tests/e2e/flows/search.spec.ts
- [X] T045 [P] [US2] Component test: SearchBar triggers search on input in tests/component/components/SearchBar.test.tsx
- [X] T046 [P] [US2] Unit test: celestrak.searchByName returns results in tests/unit/services/celestrak.test.ts

### Implementation for User Story 2

- [X] T047 [P] [US2] Create SearchBar component with debounced input in src/components/search/SearchBar.tsx
- [X] T048 [P] [US2] Create SearchResults component with satellite list in src/components/search/SearchResults.tsx
- [X] T049 [US2] Add search state and actions to AppContext in src/context/AppContext.tsx
- [X] T050 [US2] Implement CelesTrak searchByName with autocomplete in src/services/celestrak.ts
- [X] T051 [US2] Wire search components to context and handle satellite selection
- [X] T052 [US2] Add keyboard navigation (arrow keys, enter) to SearchResults
- [X] T053 [US2] Add "No results found" empty state with suggestions

**Checkpoint**: User Stories 1 AND 2 work independently - can track ISS or search for any satellite

---

## Phase 5: User Story 3 - Favorite Satellites for Quick Access (Priority: P3)

**Goal**: Save satellites to favorites list that persists across sessions

**Independent Test**: Favorite a satellite → refresh app → favorite still listed → select from favorites → tracks satellite

### Tests for User Story 3

- [X] T054 [P] [US3] E2E test: add favorite, refresh, favorite persists in tests/e2e/flows/favorites.spec.ts
- [X] T055 [P] [US3] Component test: FavoriteButton toggles state in tests/component/components/FavoriteButton.test.tsx
- [X] T056 [P] [US3] Unit test: storage service persists favorites in tests/unit/services/storage.test.ts

### Implementation for User Story 3

- [X] T057 [P] [US3] Create FavoriteButton component (heart/star icon) in src/components/favorites/FavoriteButton.tsx
- [X] T058 [P] [US3] Create FavoritesList component in src/components/favorites/FavoritesList.tsx
- [X] T059 [US3] Implement useFavorites hook with localStorage sync in src/hooks/useFavorites.ts
- [X] T060 [US3] Add favorites state and actions to AppContext
- [X] T061 [US3] Add FavoriteButton to SatelliteCard component
- [X] T062 [US3] Add favorites panel to sidebar (desktop) and bottom sheet (mobile)
- [X] T063 [US3] Load favorites on app init and restore last-viewed satellite

**Checkpoint**: User Stories 1, 2, AND 3 work independently - full satellite tracking with personalization

---

## Phase 6: User Story 4 - Predict Satellite Visibility (Priority: P4)

**Goal**: Calculate and display when satellite will be visible from user's location

**Independent Test**: Grant location → view passes → see list of upcoming passes with time/direction/elevation

### Tests for User Story 4

- [X] T064 [P] [US4] E2E test: view pass predictions with location in tests/e2e/flows/passes.spec.ts
- [X] T065 [P] [US4] Unit test: passes.calculatePasses returns valid predictions in tests/unit/services/passes.test.ts
- [X] T066 [P] [US4] Component test: PassList renders passes correctly in tests/component/components/PassList.test.tsx

### Implementation for User Story 4

- [X] T067 [US4] Implement pass prediction service in src/services/passes.ts
- [X] T068 [US4] Implement geocoding service for manual location in src/services/geocoding.ts
- [X] T069 [US4] Implement useUserLocation hook with Geolocation API in src/hooks/useUserLocation.ts
- [X] T070 [US4] Implement usePassPredictions hook in src/hooks/usePassPredictions.ts
- [X] T071 [P] [US4] Create PassList component in src/components/passes/PassList.tsx
- [X] T072 [P] [US4] Create PassCard component with details in src/components/passes/PassCard.tsx
- [X] T073 [P] [US4] Create LocationPicker component in src/components/passes/LocationPicker.tsx
- [X] T074 [US4] Add "Predict Passes" button to SatelliteCard/Details
- [X] T075 [US4] Create pass prediction modal with location handling
- [X] T076 [US4] Add visual highlighting for passes within 24 hours
- [X] T077 [US4] Handle location permission denied with manual entry fallback

**Checkpoint**: All 4 user stories complete - full-featured satellite tracker

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T078 Add offline indicator and cached data messaging
- [x] T078b Handle decayed/deorbited satellites (check decayDate, display "no longer in orbit" message)
- [x] T079 [P] Add loading skeletons for map and lists
- [x] T080 [P] Optimize bundle size (analyze and tree-shake)
- [x] T081 [P] Add ARIA labels and keyboard navigation for accessibility
- [x] T082 [P] Add meta tags and favicon in index.html
- [x] T083 Run Lighthouse audit and address performance issues
- [x] T084 Run quickstart.md validation to verify setup instructions work
- [x] T085 Final code cleanup and remove unused imports

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ──────► Phase 2 (Foundational) ──────┬──► Phase 3 (US1 - ISS View) ──► Phase 7 (Polish)
                                                      │
                                                      ├──► Phase 4 (US2 - Search)
                                                      │
                                                      ├──► Phase 5 (US3 - Favorites)
                                                      │
                                                      └──► Phase 6 (US4 - Passes)
```

### User Story Dependencies

| Story | Can Start After | Notes |
|-------|-----------------|-------|
| US1 (P1) | Phase 2 complete | MVP - no dependencies on other stories |
| US2 (P2) | Phase 2 complete | Uses same map/context from US1 but independent |
| US3 (P3) | Phase 2 complete | Uses storage service; integrates with SatelliteCard |
| US4 (P4) | Phase 2 complete | Most complex; uses new services (passes, geocoding) |

### Within Each User Story

1. Tests FIRST (write and verify they fail)
2. Components marked [P] can run in parallel
3. Hooks before component integration
4. Integration in App.tsx last
5. Verify story works independently before next phase

---

## Parallel Execution Examples

### Phase 2 - Types (All [P] can run simultaneously)

```
T010 (satellite types) ─┬─► T016 (TLE parser)
T011 (position types)  ─┤
T012 (location types)  ─┤
T013 (pass types)      ─┤
T014 (state types)     ─┘
```

### Phase 3 - User Story 1 Components

```
T034 (SatelliteMap)   ─┬─► T041 (App integration)
T035 (SatelliteMarker)─┤
T039 (SatelliteCard)  ─┤
T040 (SatelliteDetails)┘
```

### Multi-Developer Parallel Strategy

After Phase 2 completes:
- **Developer A**: User Story 1 (T032-T043)
- **Developer B**: User Story 2 (T044-T053)
- **Developer C**: User Story 3 (T054-T063)
- **Developer D**: User Story 4 (T064-T077)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ✅ Complete Phase 1: Setup (T001-T009)
2. ✅ Complete Phase 2: Foundational (T010-T031)
3. ✅ Complete Phase 3: User Story 1 (T032-T043)
4. **VALIDATE**: ISS appears, updates, shows info
5. **Deploy**: Working satellite tracker with ISS

### Incremental Delivery

| Increment | Stories | Deliverable |
|-----------|---------|-------------|
| v0.1 MVP | US1 | ISS tracker with real-time position |
| v0.2 | US1 + US2 | Track any satellite via search |
| v0.3 | US1 + US2 + US3 | Personalized favorites |
| v1.0 | All | Full pass prediction feature |

---

## Task Summary

| Phase | Task Range | Count | Parallel Tasks |
|-------|------------|-------|----------------|
| Setup | T001-T009 | 9 | 6 |
| Foundational | T010-T031 | 22 | 14 |
| US1 (P1) | T032-T043 | 12 | 5 |
| US2 (P2) | T044-T053 | 10 | 4 |
| US3 (P3) | T054-T063 | 10 | 4 |
| US4 (P4) | T064-T077 | 14 | 5 |
| Polish | T078-T085 | 8 | 5 |
| **Total** | T001-T085 | **85** | **43** |

### MVP Task Count (US1 only): 43 tasks (T001-T043)

---

## Notes

- All [P] tasks within a phase can run in parallel
- Commit after each task or logical group
- Run `npm run test` after each phase to validate
- Stop at any checkpoint to validate story independently
- Tests are included for critical paths per Constitution IV
