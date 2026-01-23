/**
 * T072: PassCard component with details
 * Displays individual pass prediction details
 */

import React from 'react';
import type { PassPrediction } from '../../types/pass';
import { getCardinalDirection, isPassUpcoming } from '../../services/passes';
import { formatTime } from '../../utils/time';

export interface PassCardProps {
  pass: PassPrediction;
  className?: string;
}

/**
 * Detailed card for a single satellite pass
 */
export const PassCard: React.FC<PassCardProps> = ({ pass, className = '' }) => {
  const isUpcoming = isPassUpcoming(pass);
  const startDirection = getCardinalDirection(pass.startAzimuth);
  const maxDirection = getCardinalDirection(pass.maxAzimuth || pass.startAzimuth);
  const endDirection = getCardinalDirection(pass.endAzimuth);
  const durationMinutes = Math.round(pass.duration / 60);

  const elevationQuality = 
    pass.maxElevation >= 60 ? { label: 'Excellent', color: 'text-green-600 dark:text-green-400' } :
    pass.maxElevation >= 30 ? { label: 'Good', color: 'text-yellow-600 dark:text-yellow-400' } :
    { label: 'Fair', color: 'text-gray-600 dark:text-gray-400' };

  return (
    <div
      className={`rounded-lg border p-4 ${
        isUpcoming
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatTime(pass.startTime)}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {pass.startTime.toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        {isUpcoming && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Soon
          </span>
        )}
      </div>

      {/* Elevation indicator */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {pass.maxElevation.toFixed(0)}°
            </span>
            <span className={`text-sm font-medium ${elevationQuality.color}`}>
              {elevationQuality.label} viewing
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Maximum elevation</p>
        </div>
        <svg
          className={`w-16 h-16 ${elevationQuality.color}`}
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
      </div>

      {/* Pass timeline */}
      <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Rise</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {formatTime(pass.startTime)} {startDirection}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Max</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {formatTime(pass.maxElevationTime)} {maxDirection}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Set</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {formatTime(pass.endTime)} {endDirection}
          </span>
        </div>
      </div>

      {/* Duration */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Duration</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {durationMinutes} {durationMinutes === 1 ? 'minute' : 'minutes'}
          </span>
        </div>
      </div>
    </div>
  );
};
