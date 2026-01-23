/**
 * T071: PassList component
 * Displays list of satellite passes
 */

import React from 'react';
import type { PassPrediction } from '../../types/pass';
import { getCardinalDirection, isPassUpcoming } from '../../services/passes';
import { formatTime } from '../../utils/time';

export interface PassListProps {
  passes: PassPrediction[];
  className?: string;
}

/**
 * List of satellite pass predictions
 */
export const PassList: React.FC<PassListProps> = ({ passes, className = '' }) => {
  if (passes.length === 0) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">
          No visible passes found in the next 7 days
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Try adjusting the minimum elevation or extending the time range
        </p>
      </div>
    );
  }

  return (
    <ul role="list" aria-label="passes" className={`divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
      {passes.map((pass, index) => {
        const isUpcoming = isPassUpcoming(pass);
        const startDirection = getCardinalDirection(pass.startAzimuth);
        const endDirection = getCardinalDirection(pass.endAzimuth);
        const durationMinutes = Math.round(pass.duration / 60);

        return (
          <li
            key={index}
            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
              isUpcoming ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
            }`}
            data-upcoming={isUpcoming}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Time and date */}
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {formatTime(pass.startTime)}
                  </p>
                  {isUpcoming && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Upcoming
                    </span>
                  )}
                </div>

                {/* Date if not today */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {pass.startTime.toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>

                {/* Pass details */}
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                    <span className="ml-1 text-gray-900 dark:text-gray-100">
                      {durationMinutes} min
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Max Elevation:</span>
                    <span className="ml-1 text-gray-900 dark:text-gray-100">
                      {pass.maxElevation.toFixed(0)}°
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Rise:</span>
                    <span className="ml-1 text-gray-900 dark:text-gray-100">
                      {startDirection} ({pass.startAzimuth.toFixed(0)}°)
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Set:</span>
                    <span className="ml-1 text-gray-900 dark:text-gray-100">
                      {endDirection} ({pass.endAzimuth.toFixed(0)}°)
                    </span>
                  </div>
                </div>
              </div>

              {/* Elevation indicator */}
              <div className="ml-4 flex-shrink-0">
                <div className="flex flex-col items-center">
                  <svg
                    className={`w-12 h-12 ${
                      pass.maxElevation >= 60 ? 'text-green-500' :
                      pass.maxElevation >= 30 ? 'text-yellow-500' :
                      'text-gray-400'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {pass.maxElevation >= 60 ? 'Excellent' :
                     pass.maxElevation >= 30 ? 'Good' :
                     'Fair'}
                  </span>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
