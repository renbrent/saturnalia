import type { TrackedSatellite } from '../../types/satellite';
import { formatCoordinates } from '../../utils/coordinates';
import { formatLocalDateTime } from '../../utils/time';
import {
  getOrbitalPeriod,
  getInclination,
  getEccentricity,
  getApogee,
  getPerigee,
} from '../../services/satellite';
import { Modal } from '../ui/Modal';

export interface SatelliteDetailsProps {
  /** Satellite to display */
  satellite: TrackedSatellite;
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback to close modal */
  onClose: () => void;
  /** Whether satellite is favorited */
  isFavorite?: boolean;
  /** Callback to toggle favorite */
  onToggleFavorite?: () => void;
}

/**
 * Detailed satellite information popup
 */
export function SatelliteDetails({
  satellite,
  isOpen,
  onClose,
  isFavorite = false,
  onToggleFavorite,
}: SatelliteDetailsProps) {
  const { position, tle } = satellite;
  const isDecayed = satellite.decayDate !== undefined;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={satellite.name} size="md">
      <div className="space-y-6" data-testid="satellite-details">
        {/* T078b: Decayed satellite warning */}
        {isDecayed && (
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h5 className="font-medium text-yellow-800 dark:text-yellow-200">
                  This satellite may no longer be in orbit
                </h5>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  The orbital data for this satellite is very old (last updated {satellite.decayDate?.toLocaleDateString() || 'unknown date'}), which may indicate it has decayed or deorbited.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Position Section */}
        <section>
          <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
            Current Position
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <InfoItem
              label="Latitude"
              value={`${position.latitude.toFixed(4)}°`}
            />
            <InfoItem
              label="Longitude"
              value={`${position.longitude.toFixed(4)}°`}
            />
            <InfoItem
              label="Altitude"
              value={`${position.altitude.toFixed(1)} km`}
            />
            <InfoItem
              label="Velocity"
              value={`${position.velocity.toFixed(2)} km/s`}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Position: {formatCoordinates(position.latitude, position.longitude)}
          </p>
        </section>

        {/* Orbital Parameters Section */}
        <section>
          <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
            Orbital Parameters
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <InfoItem
              label="Period"
              value={`${getOrbitalPeriod(tle).toFixed(1)} min`}
            />
            <InfoItem
              label="Inclination"
              value={`${getInclination(tle).toFixed(2)}°`}
            />
            <InfoItem
              label="Eccentricity"
              value={getEccentricity(tle).toFixed(6)}
            />
            <InfoItem
              label="Apogee"
              value={`${getApogee(tle).toFixed(1)} km`}
            />
            <InfoItem
              label="Perigee"
              value={`${getPerigee(tle).toFixed(1)} km`}
            />
          </div>
        </section>

        {/* Metadata Section */}
        <section>
          <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
            Satellite Info
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <InfoItem label="NORAD ID" value={satellite.noradId} />
            {satellite.intlDesignator && (
              <InfoItem label="Intl. Designator" value={satellite.intlDesignator} />
            )}
            <InfoItem
              label="TLE Epoch"
              value={formatLocalDateTime(tle.epoch)}
            />
            <InfoItem
              label="TLE Fetched"
              value={formatLocalDateTime(tle.fetchedAt)}
            />
          </div>
        </section>

        {/* Favorite button */}
        {onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            className={`w-full rounded-lg px-4 py-2 font-medium transition-colors ${
              isFavorite
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {isFavorite ? '★ Remove from Favorites' : '☆ Add to Favorites'}
          </button>
        )}
      </div>
    </Modal>
  );
}

/**
 * Helper component for info items
 */
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-mono text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  );
}
