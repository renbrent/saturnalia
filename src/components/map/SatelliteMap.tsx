import { useRef, useCallback } from 'react';
import Map, { NavigationControl, ScaleControl } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { TrackedSatellite, SatellitePosition } from '../../types/satellite';
import type { UserLocation } from '../../types/location';
import { DEFAULT_MAP_VIEW, MAPTILER_STYLE_URL } from '../../constants';
import { SatelliteMarker } from './SatelliteMarker';
import { GroundTrack } from './GroundTrack';

export interface SatelliteMapProps {
  /** Satellite to display on map */
  satellite: TrackedSatellite | null;
  /** Ground track positions */
  groundTrack?: SatellitePosition[];
  /** User's location marker */
  userLocation?: UserLocation | null;
  /** Callback when map is clicked */
  onMapClick?: (latitude: number, longitude: number) => void;
  /** Callback when satellite marker is clicked */
  onSatelliteClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Interactive world map with satellite tracking
 */
export function SatelliteMap({
  satellite,
  groundTrack,
  userLocation,
  onMapClick,
  onSatelliteClick,
  className = '',
}: SatelliteMapProps) {
  const mapRef = useRef<MapRef>(null);

  const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;
  const styleUrl = `${MAPTILER_STYLE_URL}?key=${apiKey}`;

  const handleMapClick = useCallback(
    (event: { lngLat: { lat: number; lng: number } }) => {
      if (onMapClick) {
        onMapClick(event.lngLat.lat, event.lngLat.lng);
      }
    },
    [onMapClick]
  );

  return (
    <div className={`relative h-full w-full ${className}`}>
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: satellite?.position.latitude ?? DEFAULT_MAP_VIEW.latitude,
          longitude: satellite?.position.longitude ?? DEFAULT_MAP_VIEW.longitude,
          zoom: satellite ? 3 : DEFAULT_MAP_VIEW.zoom,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={styleUrl}
        onClick={handleMapClick}
        attributionControl={{ compact: true }}
      >
        {/* Navigation controls */}
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-left" />

        {/* Ground track line */}
        {groundTrack && groundTrack.length > 0 && (
          <GroundTrack positions={groundTrack} />
        )}

        {/* Satellite marker */}
        {satellite && (
          <SatelliteMarker
            satellite={satellite}
            onClick={onSatelliteClick}
          />
        )}

        {/* User location marker */}
        {userLocation && (
          <SatelliteMarker
            satellite={null}
            userLocation={userLocation}
          />
        )}
      </Map>
    </div>
  );
}
