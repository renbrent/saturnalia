# Saturnalia

A real-time satellite tracking web application that displays the current positions of artificial satellites orbiting Earth on an interactive world map.

## Features

- **Real-time satellite tracking** - View live positions updated every second
- **Interactive world map** - Pan, zoom, and explore satellite positions globally
- **Ground track visualization** - See the orbital path for one complete orbit
- **Satellite information** - View altitude, velocity, coordinates, and orbital parameters
- **ISS by default** - International Space Station displayed on launch
- **Favorites** - Save frequently tracked satellites for quick access
- **Offline support** - Cached TLE data allows viewing last known positions

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| Maps | MapLibre GL + react-map-gl |
| Orbital Math | satellite.js (SGP4 propagator) |
| Testing | Vitest + Playwright |

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/renbrent/saturnalia.git
cd saturnalia

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run unit tests in watch mode |
| `npm run test:run` | Run unit tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run end-to-end tests with Playwright |
| `npm run lint` | Lint source files with ESLint |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

## Project Structure

```
src/
  components/       # React components
    map/            # Map display (SatelliteMap, GroundTrack, SatelliteMarker)
    satellite/      # Satellite info (SatelliteCard, SatelliteDetails)
    ui/             # Reusable UI components (Button, Modal, Loading)
  context/          # React context for global state
  hooks/            # Custom hooks (useTLEData, useSatellitePosition)
  services/         # API and business logic
    celestrak.ts    # CelesTrak API client for TLE data
    satellite.ts    # Orbital calculations using satellite.js
    storage.ts      # localStorage persistence
  types/            # TypeScript type definitions
  utils/            # Utility functions (TLE parser, coordinate helpers)
  constants/        # App constants and configuration
tests/
  unit/             # Unit tests (Vitest)
  component/        # Component tests (React Testing Library)
  e2e/              # End-to-end tests (Playwright)
```

## Data Sources

- **Satellite TLE Data**: [CelesTrak](https://celestrak.org/) - Public NORAD two-line element sets
- **Map Tiles**: [OpenStreetMap](https://www.openstreetmap.org/) via MapLibre

## How It Works

1. **TLE Fetching**: The app fetches Two-Line Element (TLE) data from CelesTrak for the selected satellite
2. **Position Calculation**: Using the satellite.js SGP4 propagator, the app calculates the satellite's current geodetic position (latitude, longitude, altitude)
3. **Real-time Updates**: Position is recalculated every second and rendered on the map
4. **Ground Track**: A full orbital period is computed to display the satellite's path around Earth

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT

## Acknowledgments

- [satellite.js](https://github.com/shashwatak/satellite-js) - SGP4/SDP4 satellite propagation
- [CelesTrak](https://celestrak.org/) - Dr. T.S. Kelso's satellite tracking resources
- [MapLibre](https://maplibre.org/) - Open-source map rendering
