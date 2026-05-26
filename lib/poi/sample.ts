export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_MI = 3958.8;

export function haversineMi(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.sqrt(h));
}

/**
 * Sample points along a polyline at roughly `stepMi` intervals.
 * Endpoints are always included.
 */
export function samplePolyline(polyline: LatLng[], stepMi: number): LatLng[] {
  if (polyline.length === 0) return [];
  if (polyline.length === 1) return [polyline[0]];

  const out: LatLng[] = [polyline[0]];
  let accumulated = 0;
  let last = polyline[0];

  for (let i = 1; i < polyline.length; i++) {
    const segLen = haversineMi(last, polyline[i]);
    accumulated += segLen;
    if (accumulated >= stepMi) {
      out.push(polyline[i]);
      accumulated = 0;
    }
    last = polyline[i];
  }

  const tail = polyline[polyline.length - 1];
  if (out[out.length - 1] !== tail) out.push(tail);
  return out;
}

/**
 * Bounding box around a polyline with a buffer in miles.
 * Used for filtering curated datasets to roughly along-route entries.
 */
export function polylineBBox(
  polyline: LatLng[],
  bufferMi: number,
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  if (polyline.length === 0) {
    return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
  }
  let minLat = Infinity,
    maxLat = -Infinity,
    minLng = Infinity,
    maxLng = -Infinity;
  for (const p of polyline) {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  }
  const latDelta = bufferMi / 69;
  const avgLat = (minLat + maxLat) / 2;
  const lngDelta = bufferMi / (69 * Math.max(0.1, Math.cos((avgLat * Math.PI) / 180)));
  return {
    minLat: minLat - latDelta,
    maxLat: maxLat + latDelta,
    minLng: minLng - lngDelta,
    maxLng: maxLng + lngDelta,
  };
}

/**
 * Distance from a point to the nearest segment of the polyline, in miles.
 * Simple O(n) walk — accurate enough for road-trip POI filtering.
 */
export function distanceToPolylineMi(point: LatLng, polyline: LatLng[]): number {
  if (polyline.length === 0) return Infinity;
  let min = Infinity;
  for (const p of polyline) {
    const d = haversineMi(point, p);
    if (d < min) min = d;
  }
  return min;
}
