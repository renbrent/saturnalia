import { useState, useEffect, useCallback } from 'react';
import {
  getFavorites,
  addFavorite as addFavoriteToStorage,
  removeFavorite as removeFavoriteFromStorage,
  isFavorite as isFavoriteInStorage,
} from '../services/storage';
import type { Favorite } from '../types/state';
import type { Satellite } from '../types/satellite';

/**
 * T059: useFavorites hook with localStorage sync
 * Manages favorite satellites with persistent storage
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  // Load favorites on mount
  useEffect(() => {
    const loadedFavorites = getFavorites();
    setFavorites(loadedFavorites);
  }, []);

  const addFavorite = useCallback((satellite: Satellite) => {
    const updatedFavorites = addFavoriteToStorage(satellite.noradId);
    setFavorites(updatedFavorites);
  }, []);

  const removeFavorite = useCallback((noradId: string) => {
    const updatedFavorites = removeFavoriteFromStorage(noradId);
    setFavorites(updatedFavorites);
  }, []);

  const toggleFavorite = useCallback(
    (satellite: Satellite) => {
      if (isFavoriteInStorage(satellite.noradId)) {
        removeFavorite(satellite.noradId);
      } else {
        addFavorite(satellite);
      }
    },
    [addFavorite, removeFavorite]
  );

  const isFavorite = useCallback((noradId: string) => {
    return isFavoriteInStorage(noradId);
  }, []);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
};
