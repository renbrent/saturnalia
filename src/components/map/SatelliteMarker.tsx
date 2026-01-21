import { Marker } from 'react-map-gl/maplibre';
import type { TrackedSatellite } from '../../types/satellite';
import type { UserLocation } from '../../types/location';

export interface SatelliteMarkerProps {
  /** Satellite to display (null if showing user location) */
  satellite: TrackedSatellite | null;
  /** User location (shown if satellite is null) */
  userLocation?: UserLocation | null;
  /** Callback when marker is clicked */
  onClick?: () => void;
}

/**
 * Map marker for satellite or user location
 */
export function SatelliteMarker({
  satellite,
  userLocation,
  onClick,
}: SatelliteMarkerProps) {
  // Show user location marker
  if (!satellite && userLocation) {
    return (
      <Marker
        latitude={userLocation.latitude}
        longitude={userLocation.longitude}
        anchor="center"
      >
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 shadow-lg ring-2 ring-white"
          title={userLocation.displayName || 'Your location'}
        >
          <div className="h-2 w-2 rounded-full bg-white" />
        </div>
      </Marker>
    );
  }

  // Show satellite marker
  if (!satellite) return null;

  return (
    <Marker
      latitude={satellite.position.latitude}
      longitude={satellite.position.longitude}
      anchor="center"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick?.();
      }}
    >
      <button
        data-testid="satellite-marker"
        className="satellite-marker flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-satellite-600 shadow-lg ring-2 ring-white transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-satellite-400"
        title={satellite.name}
        aria-label={`${satellite.name} at altitude ${satellite.position.altitude.toFixed(0)} km`}
      >
        {/* Satellite icon */}
        <svg
          className="h-6 w-6 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Satellite body */}
          <rect x="9" y="9" width="6" height="6" rx="1" />
          {/* Solar panels */}
          <line x1="3" y1="12" x2="8" y2="12" />
          <line x1="16" y1="12" x2="21" y2="12" />
          {/* Signal waves */}
          <path d="M6 6 L8 8" />
          <path d="M18 6 L16 8" />
          <path d="M6 18 L8 16" />
          <path d="M18 18 L16 16" />
        </svg>
      </button>
    </Marker>
  );
}
