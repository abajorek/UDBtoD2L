import "server-only";
import type { POI, POICategory } from "@/lib/poi/types";
import {
  type LatLng,
  distanceToPolylineMi,
  polylineBBox,
  samplePolyline,
} from "@/lib/poi/sample";
import { dedupePOIs } from "@/lib/poi/dedupe";
import { curatedFor } from "@/lib/poi/curated";
import { searchOverpass } from "@/lib/providers/overpass";
import { searchYelp } from "@/lib/providers/yelp";
import { searchGoogle } from "@/lib/providers/google";

const PROVIDERS_BY_CATEGORY: Record<
  POICategory,
  ((p: LatLng, c: POICategory, r: number) => Promise<POI[]>)[]
> = {
  dog_walk: [searchOverpass, searchGoogle, searchYelp],
  pet_friendly_stay: [searchYelp, searchGoogle],
  tv_eats: [searchYelp],
  kitsch: [searchOverpass, searchGoogle],
  rest_area: [searchOverpass],
  scenic: [searchOverpass, searchGoogle],
};

export interface FetchOptions {
  category: POICategory;
  polyline: LatLng[];
  bufferMi: number;
  samples?: number;
}

export async function fetchPOIsAlong({
  category,
  polyline,
  bufferMi,
  samples = 6,
}: FetchOptions): Promise<POI[]> {
  if (polyline.length < 2) return [];

  // pick N sample points along the polyline
  const stepMi = Math.max(20, Math.round(estimatedRouteMi(polyline) / samples));
  const sampled = samplePolyline(polyline, stepMi).slice(0, samples);

  // fan out across providers in parallel
  const providers = PROVIDERS_BY_CATEGORY[category] || [];
  const calls: Promise<POI[]>[] = [];
  for (const p of sampled) {
    for (const fn of providers) {
      calls.push(fn(p, category, bufferMi).catch(() => []));
    }
  }
  const liveResults = (await Promise.all(calls)).flat();

  // bring in curated entries inside the route bounding box
  const bbox = polylineBBox(polyline, bufferMi);
  const curated = curatedFor(category).filter(
    (p) =>
      p.lat >= bbox.minLat &&
      p.lat <= bbox.maxLat &&
      p.lng >= bbox.minLng &&
      p.lng <= bbox.maxLng,
  );

  // attach distance-from-route, drop anything beyond the buffer, then dedupe
  const merged = [...curated, ...liveResults].map((p) => ({
    ...p,
    distanceFromRouteMi: distanceToPolylineMi(p, polyline),
  }));
  const filtered = merged.filter((p) => p.distanceFromRouteMi <= bufferMi);

  return dedupePOIs(filtered).sort((a, b) => a.distanceFromRouteMi - b.distanceFromRouteMi);
}

function estimatedRouteMi(polyline: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < polyline.length; i++) {
    total += haversineMi(polyline[i - 1], polyline[i]);
  }
  return total;
}

function haversineMi(a: LatLng, b: LatLng): number {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}
