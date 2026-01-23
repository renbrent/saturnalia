/**
 * T073: LocationPicker component
 * Allows users to select location via GPS or manual entry
 */

import React, { useState } from 'react';
import type { UserLocation } from '../../types/location';
import { searchLocation, geocodingResultToUserLocation, type GeocodingResult } from '../../services/geocoding';
import { Button, Input, Loading } from '../ui';

export interface LocationPickerProps {
  currentLocation: UserLocation | null;
  onLocationSelect: (location: UserLocation) => void;
  onRequestGPS: () => void | Promise<void>;
  isRequestingGPS: boolean;
  gpsError: Error | null;
}

/**
 * Component for picking user location
 */
export const LocationPicker: React.FC<LocationPickerProps> = ({
  currentLocation,
  onLocationSelect,
  onRequestGPS,
  isRequestingGPS,
  gpsError,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<Error | null>(null);

  const handleRequestGPS = () => {
    // Handle async GPS request - errors are managed by the hook via gpsError prop
    void onRequestGPS();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await searchLocation(searchQuery);
      setSearchResults(results);
      
      if (results.length === 0) {
        setSearchError(new Error('No locations found. Try a different search.'));
      }
    } catch (error) {
      setSearchError(error instanceof Error ? error : new Error('Search failed'));
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultSelect = (result: GeocodingResult) => {
    const location = geocodingResultToUserLocation(result);
    onLocationSelect(location);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="space-y-4">
      {/* Current location display */}
      {currentLocation && (
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Current Location
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {currentLocation.displayName ||
                  `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Source: {currentLocation.source === 'gps' ? 'GPS' : 
                         currentLocation.source === 'geocoded' ? 'Search' : 'Manual'}
              </p>
            </div>
            <svg
              className="w-5 h-5 text-green-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      )}

      {/* GPS location */}
      <div>
        <Button
          onClick={handleRequestGPS}
          disabled={isRequestingGPS}
          className="w-full"
        >
          {isRequestingGPS ? (
            <>
              <Loading className="w-4 h-4 mr-2" />
              Getting location...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Use My Location
            </>
          )}
        </Button>
        
        {gpsError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {gpsError.message}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            Or search for a location
          </span>
        </div>
      </div>

      {/* Manual location search */}
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex gap-2"
        >
          <Input
            type="text"
            placeholder="City, address, or coordinates"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </form>

        {searchError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {searchError.message}
          </p>
        )}
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {searchResults.map((result, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => handleResultSelect(result)}
                  className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {result.displayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {result.latitude.toFixed(4)}, {result.longitude.toFixed(4)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
