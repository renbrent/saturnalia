import { useState, useEffect, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SatelliteMap } from './components/map';
import { SatelliteCard, SatelliteDetails } from './components/satellite';
import { SearchBar } from './components/search';
import { LoadingScreen, ErrorMessage } from './components/ui';
import { useTLEData, useSatellitePosition } from './hooks';
import { ISS_NORAD_ID } from './constants';
import { isFavorite as checkIsFavorite, addFavorite, removeFavorite } from './services/storage';
import type { Satellite, TrackedSatellite } from './types/satellite';
import './index.css';

/**
 * Main application content (inside AppProvider)
 */
function AppContent() {
  const { state, setError, clearError } = useApp();
  const [showDetails, setShowDetails] = useState(false);
  // Selected satellite ID - defaults to ISS
  const [selectedSatelliteId, setSelectedSatelliteId] = useState<string>(ISS_NORAD_ID);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch TLE data for selected satellite
  const { tle, satellite, isLoading: tleLoading, error: tleError, refresh } = useTLEData(selectedSatelliteId);

  // Calculate real-time position
  const { position, groundTrack, error: positionError } = useSatellitePosition(tle);

  // Check favorite status
  useEffect(() => {
    setIsFavorite(checkIsFavorite(selectedSatelliteId));
  }, [selectedSatelliteId]);

  // Handle errors
  useEffect(() => {
    if (tleError) {
      setError({
        code: 'TLE_FETCH_FAILED',
        message: 'Failed to fetch satellite data. Please try again.',
        details: tleError.message,
      });
    } else if (positionError) {
      setError({
        code: 'POSITION_CALCULATION_FAILED',
        message: 'Unable to calculate satellite position.',
        details: positionError.message,
      });
    }
  }, [tleError, positionError, setError]);

  // Build tracked satellite object
  const trackedSatellite: TrackedSatellite | null =
    satellite && tle && position
      ? {
          ...satellite,
          tle,
          position,
        }
      : null;

  // Toggle favorite
  const handleToggleFavorite = useCallback(() => {
    if (isFavorite) {
      removeFavorite(selectedSatelliteId);
      setIsFavorite(false);
    } else {
      addFavorite(selectedSatelliteId);
      setIsFavorite(true);
    }
  }, [selectedSatelliteId, isFavorite]);

  // Handle satellite selection from search
  const handleSatelliteSelect = useCallback((satellite: Satellite) => {
    setSelectedSatelliteId(satellite.noradId);
  }, []);

  // Loading state
  if (state.isLoading || (tleLoading && !trackedSatellite)) {
    return <LoadingScreen text="Loading satellite data..." />;
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-gray-100 dark:bg-gray-900 lg:flex-row">
      {/* Error banner */}
      {state.error && (
        <ErrorMessage
          error={state.error}
          onDismiss={clearError}
          variant="banner"
        />
      )}

      {/* Map - full width on mobile, flex-1 on desktop */}
      <main className="relative flex-1">
        <SatelliteMap
          satellite={trackedSatellite}
          groundTrack={groundTrack}
          onSatelliteClick={() => setShowDetails(true)}
          className="h-full w-full"
        />

        {/* Loading overlay */}
        {tleLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20" data-testid="loading">
            <div className="rounded-lg bg-white px-4 py-2 shadow-lg dark:bg-gray-800">
              <span className="text-sm">Refreshing data...</span>
            </div>
          </div>
        )}
      </main>

      {/* Sidebar - bottom on mobile, right side on desktop */}
      <aside className="w-full shrink-0 bg-white p-4 shadow-lg dark:bg-gray-800 lg:h-full lg:w-80 lg:overflow-y-auto">
        {/* Search bar */}
        <SearchBar 
          onSelect={handleSatelliteSelect} 
          className="mb-4"
        />

        {trackedSatellite ? (
          <SatelliteCard
            satellite={trackedSatellite}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
            onViewDetails={() => setShowDetails(true)}
          />
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>No satellite selected</p>
          </div>
        )}

        {/* Refresh button */}
        <button
          onClick={refresh}
          disabled={tleLoading}
          className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {tleLoading ? 'Refreshing...' : 'Refresh TLE Data'}
        </button>
      </aside>

      {/* Details modal */}
      {trackedSatellite && (
        <SatelliteDetails
          satellite={trackedSatellite}
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
}

/**
 * Root App component with providers
 */
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
