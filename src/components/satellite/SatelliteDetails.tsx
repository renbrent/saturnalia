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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={satellite.name} size="md">
      <div className="space-y-6" data-testid="satellite-details">
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
