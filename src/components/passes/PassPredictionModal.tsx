/**
 * T074-T077: Pass Prediction Modal
 * Modal for viewing satellite pass predictions with location handling
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui';
import { PassList, LocationPicker } from '../passes';
import { useUserLocation, usePassPredictions } from '../../hooks';
import type { TrackedSatellite } from '../../types/satellite';
import type { PassPredictionOptions } from '../../types/pass';

export interface PassPredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  satellite: TrackedSatellite | null;
}

/**
 * Modal for displaying satellite pass predictions
 */
export const PassPredictionModal: React.FC<PassPredictionModalProps> = ({
  isOpen,
  onClose,
  satellite,
}) => {
  const {
    location,
    isLoading: isLoadingLocation,
    error: locationError,
    requestLocation,
    setManualLocation,
    clearLocation,
  } = useUserLocation();

  const {
    passes,
    isCalculating,
    error: passError,
    calculate,
  } = usePassPredictions();

  const [options, setOptions] = useState<PassPredictionOptions>({
    days: 7,
    minElevation: 10,
  });

  // Track if we've calculated passes for this satellite/location combo
  const [lastCalculatedFor, setLastCalculatedFor] = useState<string | null>(null);

  // Calculate passes when location or satellite changes (by ID, not reference)
  useEffect(() => {
    if (satellite && location && isOpen) {
      // Create a stable key based on satellite ID and location coords
      const calculationKey = `${satellite.noradId}-${location.latitude}-${location.longitude}-${options.days}-${options.minElevation}`;
      
      // Only recalculate if the key changed
      if (calculationKey !== lastCalculatedFor) {
        setLastCalculatedFor(calculationKey);
        calculate(satellite.tle, location, options);
      }
    }
  }, [satellite?.noradId, satellite?.tle, location?.latitude, location?.longitude, isOpen, options.days, options.minElevation, calculate, lastCalculatedFor]);

  if (!satellite) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Pass Predictions: ${satellite.name}`}>
      <div className="space-y-6">
        {/* Location Selection */}
        {!location ? (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Select Your Location
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              To predict when {satellite.name} will be visible, we need your location.
            </p>
            <LocationPicker
              currentLocation={location}
              onLocationSelect={setManualLocation}
              onRequestGPS={requestLocation}
              isRequestingGPS={isLoadingLocation}
              gpsError={locationError}
            />
          </div>
        ) : (
          <>
            {/* Location Display with Change Option */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Your Location
                </h3>
                <button
                  type="button"
                  onClick={clearLocation}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Change
                </button>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {location.displayName ||
                    `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Source: {location.source === 'gps' ? 'GPS' :
                           location.source === 'geocoded' ? 'Search' : 'Manual'}
                </p>
              </div>
            </div>

            {/* Prediction Options */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                Prediction Settings
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="days"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Days ahead
                  </label>
                  <select
                    id="days"
                    value={options.days}
                    onChange={(e) => setOptions({ ...options, days: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="1">1 day</option>
                    <option value="3">3 days</option>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="minElevation"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Min. elevation
                  </label>
                  <select
                    id="minElevation"
                    value={options.minElevation}
                    onChange={(e) => setOptions({ ...options, minElevation: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="0">0° (All passes)</option>
                    <option value="10">10° (Good)</option>
                    <option value="20">20° (Better)</option>
                    <option value="30">30° (Best)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pass Predictions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                Upcoming Passes
              </h3>
              
              <div className="min-h-[200px]">
                {isCalculating ? (
                  <div className="text-center p-8">
                    <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Calculating passes...
                    </p>
                  </div>
                ) : passError ? (
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {passError.message}
                    </p>
                  </div>
                ) : (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-[400px] overflow-y-auto overscroll-contain">
                    <PassList passes={passes} />
                  </div>
                )}
              </div>
            </div>

            {/* Info note */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-blue-500 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Tip:</strong> Passes with higher elevation angles provide better viewing opportunities.
                    {passes.some(p => p.maxElevation >= 40) && ' You have some excellent passes coming up!'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
