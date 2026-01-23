import { useState, useEffect, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SatelliteMap } from './components/map';
import { SatelliteCard, SatelliteDetails } from './components/satellite';
import { SearchBar } from './components/search';
import { FavoritesList } from './components/favorites';
import { PassPredictionModal } from './components/passes';
import { LoadingScreen, ErrorMessage } from './components/ui';
import { useTLEData, useSatellitePosition } from './hooks';
import { ISS_NORAD_ID } from './constants';
import { getLastSatellite, setLastSatellite } from './services/storage';
import type { Satellite, TrackedSatellite } from './types/satellite';
import './index.css';

/**
 * Main application content (inside AppProvider)
 */
function AppContent() {
  const { state, addFavorite, removeFavorite, setError, clearError } = useApp();
  const [showDetails, setShowDetails] = useState(false);
  const [showPasses, setShowPasses] = useState(false);
  
  // T063: Load last-viewed satellite on init, or default to ISS
  const [selectedSatelliteId, setSelectedSatelliteId] = useState<string>(() => {
    return getLastSatellite() || ISS_NORAD_ID;
  });

  // Save last satellite when selection changes
  useEffect(() => {
    setLastSatellite(selectedSatelliteId);
  }, [selectedSatelliteId]);

  // Fetch TLE data for selected satellite
  const { tle, satellite, isLoading: tleLoading, error: tleError, refresh } = useTLEData(selectedSatelliteId);

  // Calculate real-time position
  const { position, groundTrack, error: positionError } = useSatellitePosition(tle);

  // Check if current satellite is favorited
  const isFavorite = state.favorites.some(f => f.noradId === selectedSatelliteId);

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
    } else if (satellite) {
      addFavorite({ noradId: selectedSatelliteId, addedAt: new Date() });
    }
  }, [selectedSatelliteId, isFavorite, satellite, addFavorite, removeFavorite]);

  // Handle satellite selection from search or favorites
  const handleSatelliteSelect = useCallback((satellite: Satellite) => {
    setSelectedSatelliteId(satellite.noradId);
  }, []);

  // Handle favorite selection by ID
  const handleFavoriteSelect = useCallback((noradId: string) => {
    setSelectedSatelliteId(noradId);
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
      <aside className="w-full shrink-0 bg-white dark:bg-gray-800 lg:h-full lg:w-80 lg:overflow-y-auto shadow-lg flex flex-col">
        {/* Search bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <SearchBar 
            onSelect={handleSatelliteSelect}
          />
        </div>

        {/* T062: Favorites panel */}
        {state.favorites.length > 0 && (
          <div className="border-b border-gray-200 dark:border-gray-700">
            <FavoritesList
              favorites={state.favorites.map(fav => ({
                noradId: fav.noradId,
                satellite: state.searchResults.find(s => s.noradId === fav.noradId)
              }))}
              onSelect={handleFavoriteSelect}
              currentSatelliteId={selectedSatelliteId}
            />
          </div>
        )}

        {/* Satellite card */}
        <div className="p-4 flex-1">
          {trackedSatellite ? (
            <SatelliteCard
              satellite={trackedSatellite}
              isFavorite={isFavorite}
              onToggleFavorite={handleToggleFavorite}
              onViewDetails={() => setShowDetails(true)}
              onViewPasses={() => setShowPasses(true)}
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
        </div>
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

      {/* T074-T077: Pass prediction modal */}
      <PassPredictionModal
        isOpen={showPasses}
        onClose={() => setShowPasses(false)}
        satellite={trackedSatellite}
      />
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
