import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import type {
  AppState,
  AppAction,
  AppError,
  Satellite,
  SatellitePosition,
  TLEData,
  Favorite,
  PassPrediction,
} from '../types';
import type { UserLocation } from '../types/location';
import { getFavorites, setFavorites as saveFavorites, getTLECache, getUserLocation } from '../services/storage';

/**
 * Initial application state
 */
const initialState: AppState = {
  currentSatellite: null,
  currentPosition: null,
  favorites: [],
  userLocation: null,
  tleCache: {},
  searchResults: [],
  passes: [],
  isLoading: true,
  error: null,
};

/**
 * App state reducer
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_SATELLITE':
      return { ...state, currentSatellite: action.payload };

    case 'SET_CURRENT_POSITION':
      return { ...state, currentPosition: action.payload };

    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload };

    case 'ADD_FAVORITE':
      if (state.favorites.some((f) => f.noradId === action.payload.noradId)) {
        return state;
      }
      return { ...state, favorites: [...state.favorites, action.payload] };

    case 'REMOVE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.filter((f) => f.noradId !== action.payload),
      };

    case 'SET_USER_LOCATION':
      return { ...state, userLocation: action.payload };

    case 'SET_TLE_CACHE':
      return { ...state, tleCache: action.payload };

    case 'UPDATE_TLE_CACHE':
      return {
        ...state,
        tleCache: { ...state.tleCache, [action.payload.noradId]: action.payload },
      };

    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };

    case 'SET_PASSES':
      return { ...state, passes: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
}

/**
 * Context type with state and actions
 */
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Convenience actions
  setCurrentSatellite: (satellite: Satellite | null) => void;
  setCurrentPosition: (position: SatellitePosition | null) => void;
  addFavorite: (favorite: Favorite) => void;
  removeFavorite: (noradId: string) => void;
  setUserLocation: (location: UserLocation | null) => void;
  updateTLECache: (tle: TLEData) => void;
  setSearchResults: (results: Satellite[]) => void;
  setPasses: (passes: PassPrediction[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: AppError | null) => void;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

/**
 * App state provider component
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persisted data on mount
  useEffect(() => {
    const loadPersistedData = () => {
      try {
        const favorites = getFavorites();
        const tleCache = getTLECache();
        const userLocation = getUserLocation();

        dispatch({ type: 'SET_FAVORITES', payload: favorites });
        dispatch({ type: 'SET_TLE_CACHE', payload: tleCache });
        if (userLocation) {
          dispatch({ type: 'SET_USER_LOCATION', payload: userLocation });
        }
      } catch (e) {
        console.error('Failed to load persisted data:', e);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadPersistedData();
  }, []);

  // Persist favorites when they change
  useEffect(() => {
    if (!state.isLoading) {
      saveFavorites(state.favorites);
    }
  }, [state.favorites, state.isLoading]);

  // Convenience action creators
  const setCurrentSatellite = useCallback((satellite: Satellite | null) => {
    dispatch({ type: 'SET_CURRENT_SATELLITE', payload: satellite });
  }, []);

  const setCurrentPosition = useCallback((position: SatellitePosition | null) => {
    dispatch({ type: 'SET_CURRENT_POSITION', payload: position });
  }, []);

  const addFavorite = useCallback((favorite: Favorite) => {
    dispatch({ type: 'ADD_FAVORITE', payload: favorite });
  }, []);

  const removeFavorite = useCallback((noradId: string) => {
    dispatch({ type: 'REMOVE_FAVORITE', payload: noradId });
  }, []);

  const setUserLocation = useCallback((location: UserLocation | null) => {
    dispatch({ type: 'SET_USER_LOCATION', payload: location });
  }, []);

  const updateTLECache = useCallback((tle: TLEData) => {
    dispatch({ type: 'UPDATE_TLE_CACHE', payload: tle });
  }, []);

  const setSearchResults = useCallback((results: Satellite[]) => {
    dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
  }, []);

  const setPasses = useCallback((passes: PassPrediction[]) => {
    dispatch({ type: 'SET_PASSES', payload: passes });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: AppError | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: AppContextType = {
    state,
    dispatch,
    setCurrentSatellite,
    setCurrentPosition,
    addFavorite,
    removeFavorite,
    setUserLocation,
    updateTLECache,
    setSearchResults,
    setPasses,
    setLoading,
    setError,
    clearError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Hook to access app state and actions
 */
export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

/**
 * Hook to access just the state (for components that only read)
 */
export function useAppState(): AppState {
  const { state } = useApp();
  return state;
}
