import type { TrackedSatellite } from '../../types/satellite';
import { formatCoordinates } from '../../utils/coordinates';
import { FavoriteButton } from '../favorites/FavoriteButton';

export interface SatelliteCardProps {
  /** Satellite to display */
  satellite: TrackedSatellite;
  /** Whether satellite is favorited */
  isFavorite?: boolean;
  /** Callback to toggle favorite */
  onToggleFavorite?: () => void;
  /** Callback to view pass predictions */
  onViewPasses?: () => void;
  /** Callback to view details */
  onViewDetails?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Compact satellite information card
 */
export function SatelliteCard({
  satellite,
  isFavorite = false,
  onToggleFavorite,
  onViewPasses,
  onViewDetails,
  className = '',
}: SatelliteCardProps) {
  const { position } = satellite;

  return (
    <div
      className={`rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 ${className}`}
      data-testid="satellite-card"
    >
      {/* Header with name and favorite button */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {satellite.name}
        </h3>
        {onToggleFavorite && (
          <FavoriteButton
            satellite={satellite}
            isFavorited={isFavorite}
            onToggle={() => onToggleFavorite()}
          />
        )}
      </div>

      {/* Position info */}
      <div className="space-y-2 text-sm" data-testid="satellite-position">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Position</span>
          <span className="font-mono text-gray-900 dark:text-gray-100">
            {formatCoordinates(position.latitude, position.longitude)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Altitude</span>
          <span className="font-mono text-gray-900 dark:text-gray-100">
            {position.altitude.toFixed(1)} km
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Velocity</span>
          <span className="font-mono text-gray-900 dark:text-gray-100">
            {position.velocity.toFixed(2)} km/s
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex gap-2">
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="flex-1 rounded-lg bg-satellite-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-satellite-700"
          >
            Details
          </button>
        )}
        {onViewPasses && (
          <button
            onClick={onViewPasses}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Passes
          </button>
        )}
      </div>
    </div>
  );
}
