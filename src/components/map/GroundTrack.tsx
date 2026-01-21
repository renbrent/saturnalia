import { Source, Layer } from 'react-map-gl/maplibre';
import type { SatellitePosition } from '../../types/satellite';

export interface GroundTrackProps {
  /** Array of positions forming the ground track */
  positions: SatellitePosition[];
  /** Line color */
  color?: string;
  /** Line width */
  width?: number;
}

/**
 * Ground track line showing satellite orbital path
 */
export function GroundTrack({
  positions,
  color = '#0ea5e9',
  width = 2,
}: GroundTrackProps) {
  if (positions.length < 2) return null;

  // Split track at antimeridian crossing to avoid line wrapping
  const segments = splitAtAntimeridian(positions);

  const geojson: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: segments.map((segment) => ({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: segment.map((p) => [p.longitude, p.latitude]),
      },
    })),
  };

  return (
    <Source id="ground-track" type="geojson" data={geojson}>
      <Layer
        id="ground-track-line"
        type="line"
        paint={{
          'line-color': color,
          'line-width': width,
          'line-opacity': 0.7,
        }}
      />
    </Source>
  );
}

/**
 * Split ground track at antimeridian (±180°) crossings
 * to prevent the line from wrapping across the map
 */
function splitAtAntimeridian(positions: SatellitePosition[]): SatellitePosition[][] {
  const segments: SatellitePosition[][] = [];
  let currentSegment: SatellitePosition[] = [];

  for (let i = 0; i < positions.length; i++) {
    const current = positions[i];
    const prev = positions[i - 1];

    // Check for antimeridian crossing
    if (prev && Math.abs(current.longitude - prev.longitude) > 180) {
      // Save current segment and start new one
      if (currentSegment.length > 0) {
        segments.push(currentSegment);
      }
      currentSegment = [current];
    } else {
      currentSegment.push(current);
    }
  }

  // Don't forget the last segment
  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }

  return segments;
}
