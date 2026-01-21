# Quickstart: Satellite Tracker

**Feature**: 001-satellite-tracker  
**Date**: 2026-01-20

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or pnpm 8+
- MapTiler API key (free tier: https://cloud.maptiler.com/account/keys/)

## Initial Setup

### 1. Create Vite Project

```bash
npm create vite@latest saturnalia -- --template react-ts
cd saturnalia
```

### 2. Install Dependencies

```bash
# Core dependencies
npm install react-map-gl maplibre-gl satellite.js

# Styling
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Development tools
npm install -D @types/satellite.js vitest @testing-library/react @testing-library/jest-dom
npm install -D playwright @playwright/test
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D prettier eslint-config-prettier

# PWA support (optional, for offline)
npm install -D vite-plugin-pwa
```

### 3. Configure Tailwind

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* MapLibre container must have explicit height */
.maplibregl-map {
  width: 100%;
  height: 100%;
}
```

### 4. Environment Variables

Create `.env.local`:

```bash
VITE_MAPTILER_API_KEY=your_maptiler_api_key_here
```

Add to `.gitignore`:

```
.env.local
.env.*.local
```

### 5. Configure Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
```

### 6. Configure ESLint & Prettier

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "react-refresh"],
  "rules": {
    "react-refresh/only-export-components": "warn"
  }
}
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2
}
```

### 7. Configure Playwright

```bash
npx playwright install
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Project Structure

Create the directory structure:

```bash
mkdir -p src/{components/{map,search,satellite,favorites,passes,ui},context,hooks,services,types,utils,constants}
mkdir -p tests/{unit/{services,utils},component/components,e2e/flows}
```

## Running the App

### Development

```bash
npm run dev
```

Opens at http://localhost:5173

### Testing

```bash
# Unit tests
npm run test

# Unit tests with coverage
npm run test:coverage

# E2E tests
npx playwright test
```

### Build

```bash
npm run build
npm run preview
```

## Quick Verification

After setup, verify the stack works:

```typescript
// src/App.tsx - minimal test
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

function App() {
  return (
    <div className="h-screen w-screen">
      <Map
        initialViewState={{
          longitude: 0,
          latitude: 0,
          zoom: 1,
        }}
        mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`}
      />
    </div>
  );
}

export default App;
```

If the map loads, the setup is complete.

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run unit tests |
| `npm run test:ui` | Run tests with UI |
| `npm run lint` | Lint code |
| `npm run format` | Format with Prettier |

## External Services

| Service | Purpose | Signup |
|---------|---------|--------|
| MapTiler | Map tiles | https://cloud.maptiler.com/ |
| CelesTrak | Satellite TLE data | None (public) |
| Nominatim | Geocoding | None (public, respect rate limits) |

## Troubleshooting

### Map doesn't load
- Check `VITE_MAPTILER_API_KEY` is set in `.env.local`
- Verify key is valid at https://cloud.maptiler.com/account/keys/

### TypeScript errors with satellite.js
- Install types: `npm install -D @types/satellite.js`
- If types are outdated, create `src/types/satellite.js.d.ts` with declarations

### Tests fail to find DOM elements
- Ensure `@testing-library/jest-dom` is imported in `tests/setup.ts`
- Check Vitest config includes `setupFiles`
