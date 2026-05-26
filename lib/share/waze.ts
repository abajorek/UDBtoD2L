import type { POI, Waypoint } from "@/lib/poi/types";

/**
 * Build a Waze deep link. On mobile this opens the Waze app to the
 * coordinates; on desktop it opens waze.com with the location pinned.
 * Waze does not support multi-stop trips via URL — to navigate a chain
 * of stops, open them one at a time.
 */
export function wazeUrl(target: { lat: number; lng: number; name?: string }): string {
  const params = new URLSearchParams({
    ll: `${target.lat},${target.lng}`,
    navigate: "yes",
  });
  if (target.name) params.set("q", target.name);
  return `https://www.waze.com/ul?${params.toString()}`;
}

export function wazeUrlForPOI(poi: POI): string {
  return wazeUrl({ lat: poi.lat, lng: poi.lng, name: poi.name });
}

export function wazeUrlForWaypoint(wp: Waypoint): string {
  return wazeUrl({ lat: wp.lat, lng: wp.lng, name: wp.name });
}
