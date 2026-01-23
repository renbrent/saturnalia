# Feature Specification: Satellite Tracker

**Feature Branch**: `001-satellite-tracker`  
**Created**: 2026-01-20  
**Status**: Draft  
**Input**: User description: "Develop Saturnalia, a web application that shows the current positions of artificial satellites orbiting earth. It should allow users to search different satellites orbiting earth, favorite certain satellites, and predict when the satellite will be above the user's current location. When the user enters the app, it should show by default the international space station. The user can determine the next time the targeted satellite when it will be close to the user's location."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View ISS Position on App Launch (Priority: P1)

As a user opening Saturnalia for the first time, I want to immediately see the International Space Station's current position on a world map so I can understand what the app does without any setup.

**Why this priority**: This is the entry point experience. Users must see value within seconds of opening the app. The ISS is universally recognizable and orbits frequently, making it ideal as the default.

**Independent Test**: Can be fully tested by opening the app and verifying the ISS appears on the map with its current position updating in near real-time. Delivers immediate value as a standalone satellite viewer.

**Acceptance Scenarios**:

1. **Given** a user opens the app for the first time, **When** the home screen loads, **Then** a world map displays with the ISS's current position marked and labeled
2. **Given** the ISS position is displayed, **When** 10 seconds elapse, **Then** the position marker updates to reflect the satellite's movement
3. **Given** the user is viewing the ISS, **When** they tap/click on the satellite marker, **Then** they see basic information (name, altitude, velocity, orbital period)

---

### User Story 2 - Search and Select Satellites (Priority: P2)

As a space enthusiast, I want to search for satellites by name so I can track specific satellites I'm interested in (e.g., Hubble, Starlink, weather satellites).

**Why this priority**: Search unlocks the full catalog of satellites beyond the ISS default. Without search, users are limited to one satellite. This transforms the app from a single-purpose ISS tracker to a comprehensive satellite tracker.

**Independent Test**: Can be tested by entering satellite names in the search field and verifying matching results appear. Delivers value by letting users discover and track any cataloged satellite.

**Acceptance Scenarios**:

1. **Given** the user is on the home screen, **When** they tap the search field and type "Hubble", **Then** the search results show "Hubble Space Telescope" with a way to select it
2. **Given** search results are displayed, **When** the user selects a satellite from results, **Then** the map centers on that satellite and begins tracking it
3. **Given** the user searches for a term, **When** no satellites match the query, **Then** a friendly "No satellites found" message appears with suggestions
4. **Given** the user is typing in search, **When** at least 2 characters are entered, **Then** results begin appearing (autocomplete behavior)

---

### User Story 3 - Favorite Satellites for Quick Access (Priority: P3)

As a returning user, I want to save my favorite satellites so I can quickly switch between satellites I regularly track without searching each time.

**Why this priority**: Favorites reduce friction for repeat usage. Once users discover satellites they care about, they shouldn't have to search repeatedly. This builds engagement and personalization.

**Independent Test**: Can be tested by favoriting a satellite, closing and reopening the app, and verifying the favorite persists. Delivers value as a personalized quick-access feature.

**Acceptance Scenarios**:

1. **Given** the user is viewing a satellite's details, **When** they tap the "favorite" button (heart/star icon), **Then** the satellite is added to their favorites list
2. **Given** the user has favorited satellites, **When** they access the favorites section, **Then** all favorited satellites appear in a list
3. **Given** the user selects a satellite from favorites, **When** they tap on it, **Then** the map immediately centers on and tracks that satellite
4. **Given** the user wants to remove a favorite, **When** they tap unfavorite on a saved satellite, **Then** it is removed from their favorites list

---

### User Story 4 - Predict Satellite Visibility from User's Location (Priority: P4)

As a skywatcher, I want to know when a satellite will be visible from my current location so I can go outside at the right time to observe it.

**Why this priority**: Visibility prediction is the most complex feature but provides the highest engagement value. Users can plan real-world activities around satellite passes. Requires location services and orbital calculations.

**Independent Test**: Can be tested by allowing location access, selecting a satellite, and viewing upcoming pass predictions. Delivers value by connecting the digital tracker to real-world observation opportunities.

**Acceptance Scenarios**:

1. **Given** the user has granted location permission, **When** they view a satellite's details and tap "Predict Passes", **Then** they see a list of upcoming times when the satellite will pass near their location
2. **Given** pass predictions are displayed, **When** the user views a specific pass, **Then** they see: date/time, direction (compass bearing), maximum elevation, and duration of visibility
3. **Given** the user has not granted location permission, **When** they attempt to view predictions, **Then** they are prompted to enable location or manually enter coordinates
4. **Given** a predicted pass is within the next 24 hours, **When** viewing predictions, **Then** that pass is visually highlighted as "upcoming soon"

---

### Edge Cases

- What happens when the satellite data source is temporarily unavailable?
  - Display cached data with a "Last updated X minutes ago" indicator; show error message if no cached data exists
- What happens when the user denies location permission permanently?
  - Allow manual entry of coordinates (latitude/longitude) or city name as fallback
- What happens when a satellite has decayed/deorbited?
  - Display "This satellite is no longer in orbit" message with last known date
- What happens when the user has poor internet connectivity?
  - Show offline indicator; continue displaying last known positions; queue favorite actions for sync
- What happens when the user searches for classified or military satellites?
  - Only display publicly cataloged satellites (NORAD public catalog); no results for classified objects

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a world map showing satellite positions in real-time
- **FR-002**: System MUST default to showing the International Space Station (NORAD ID: 25544) on first launch
- **FR-003**: System MUST update satellite positions at least every 10 seconds during active viewing
- **FR-004**: System MUST provide a search function that queries satellites by name (partial match supported)
- **FR-005**: System MUST display satellite information including: name, altitude, velocity, position coordinates, and orbital parameters (period, inclination, eccentricity, apogee, perigee)
- **FR-006**: System MUST allow users to favorite/unfavorite satellites
- **FR-007**: System MUST persist user favorites across sessions (browser local storage or user account)
- **FR-008**: System MUST calculate and display upcoming pass predictions for the user's location
- **FR-009**: System MUST request user location permission for pass predictions (with manual entry fallback)
- **FR-010**: Pass predictions MUST include: date/time, compass direction, maximum elevation angle, and pass duration
- **FR-011**: System MUST work on both mobile (320px+) and desktop (1024px+) viewports
- **FR-012**: System MUST display satellite ground tracks (orbital path projection on map)
- **FR-013**: System MUST source satellite data from publicly available TLE (Two-Line Element) data

### Assumptions

- Satellite position data will be sourced from public APIs (e.g., CelesTrak, N2YO, or Space-Track)
- TLE data is refreshed from source at least once per day for accuracy
- Pass predictions are calculated for a 7-day lookahead window by default
- "Visible" passes include any pass above 10° elevation (astronomical horizon)
- User favorites are stored locally; no user accounts required for MVP

### Key Entities

- **Satellite**: Represents an orbiting object with NORAD catalog ID, name, TLE data, current position (lat/long/altitude), velocity, and orbital parameters
- **Favorite**: Association between a user session and a satellite they've saved for quick access
- **Pass Prediction**: A calculated future event when a satellite will be visible from a specific location, including time, direction, elevation, and duration
- **User Location**: Geographic coordinates (latitude/longitude) either from device GPS or manually entered

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can see the ISS position on the map within 3 seconds of app load
- **SC-002**: Satellite search returns results within 1 second of query submission
- **SC-003**: 95% of users can successfully search for and track a satellite on their first attempt
- **SC-004**: Users can add a satellite to favorites in under 2 taps/clicks
- **SC-005**: Pass predictions display within 2 seconds of request
- **SC-006**: App remains responsive and functional on 3G network connections
- **SC-007**: Users report the app is "easy to use" in satisfaction surveys (target: 80%+ positive)
- **SC-008**: Real-time position updates are accurate to within 10km of actual satellite position
