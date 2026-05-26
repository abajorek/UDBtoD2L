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
  rest_area: [searchOverpass, searchGoogle],
  scenic: [searchOverpass, searchGoogle],
  fuel: [searchOverpass, searchGoogle],
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

  // Curated entries are pre-vetted to be near the corridor — keep them as long as
  // they're inside a generous bounding box. Live results get the strict
  // distance-from-route check.
  const generousBbox = polylineBBox(polyline, Math.max(bufferMi * 3, 75));
  const curated = curatedFor(category)
    .filter(
      (p) =>
        p.lat >= generousBbox.minLat &&
        p.lat <= generousBbox.maxLat &&
        p.lng >= generousBbox.minLng &&
        p.lng <= generousBbox.maxLng,
    )
    .map((p) => ({ ...p, distanceFromRouteMi: distanceToPolylineMi(p, polyline) }));

  const liveWithDistance = liveResults
    .map((p) => ({ ...p, distanceFromRouteMi: distanceToPolylineMi(p, polyline) }))
    .filter((p) => p.distanceFromRouteMi <= bufferMi);

  const filtered = [...curated, ...liveWithDistance];

  const deduped = dedupePOIs(filtered);

  if (category === "fuel") {
    // sort by price tier first (cheap > avg > premium > unknown), then distance-from-route
    const tierRank = { cheap: 0, average: 1, premium: 2 } as const;
    return deduped.sort((a, b) => {
      const at = a.priceTier ? tierRank[a.priceTier] : 3;
      const bt = b.priceTier ? tierRank[b.priceTier] : 3;
      if (at !== bt) return at - bt;
      return a.distanceFromRouteMi - b.distanceFromRouteMi;
    });
  }

  if (category === "rest_area") {
    // toilet rating descending, then distance ascending
    return deduped.sort((a, b) => {
      const at = a.toiletRating ?? 0;
      const bt = b.toiletRating ?? 0;
      if (at !== bt) return bt - at;
      return a.distanceFromRouteMi - b.distanceFromRouteMi;
    });
  }

  return deduped.sort((a, b) => a.distanceFromRouteMi - b.distanceFromRouteMi);
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
