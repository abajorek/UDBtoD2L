import "server-only";
import polyline from "@mapbox/polyline";
import { env } from "@/lib/env";
import type { LatLng } from "@/lib/poi/sample";
import { LRU } from "@/lib/cache/lru";

export interface DirectionsResult {
  polyline: LatLng[];
  distanceMi: number;
  durationMin: number;
}

const cache = new LRU<string, DirectionsResult>(64);

export async function getDirections(from: LatLng, to: LatLng): Promise<DirectionsResult> {
  if (!env.MAPBOX_SECRET_TOKEN) {
    throw new Error("MAPBOX_SECRET_TOKEN not set");
  }
  const key = `${from.lat},${from.lng};${to.lat},${to.lng}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}` +
    `?geometries=polyline&overview=full&access_token=${env.MAPBOX_SECRET_TOKEN}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Mapbox Directions ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as {
    routes: { geometry: string; distance: number; duration: number }[];
  };
  const route = json.routes?.[0];
  if (!route) throw new Error("Mapbox returned no routes");

  const decoded = polyline.decode(route.geometry).map(([lat, lng]) => ({ lat, lng }));
  const result: DirectionsResult = {
    polyline: decoded,
    distanceMi: route.distance / 1609.344,
    durationMin: route.duration / 60,
  };
  cache.set(key, result);
  return result;
}
