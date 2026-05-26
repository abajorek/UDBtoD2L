import "server-only";
import type { LatLng } from "@/lib/poi/sample";
import type { POI, POICategory } from "@/lib/poi/types";
import { env, warnMissingOnce } from "@/lib/env";
import { detectBrand, priceTierFor, toiletRatingFor } from "@/lib/poi/quality";

interface GooglePlace {
  place_id: string;
  name: string;
  geometry: { location: { lat: number; lng: number } };
  rating?: number;
  photos?: { photo_reference: string }[];
  vicinity?: string;
  types?: string[];
}

const TYPES: Partial<Record<POICategory, string>> = {
  dog_walk: "park",
  pet_friendly_stay: "lodging",
  kitsch: "tourist_attraction",
  scenic: "tourist_attraction",
  tv_eats: "restaurant",
  fuel: "gas_station",
  rest_area: "gas_station",
};

export async function searchGoogle(
  point: LatLng,
  category: POICategory,
  radiusMi: number,
): Promise<POI[]> {
  if (!env.GOOGLE_PLACES_API_KEY) {
    warnMissingOnce("GOOGLE_PLACES_API_KEY");
    return [];
  }
  const type = TYPES[category];
  if (!type) return [];

  const params = new URLSearchParams({
    location: `${point.lat},${point.lng}`,
    radius: String(Math.min(50000, Math.round(radiusMi * 1609.344))),
    type,
    key: env.GOOGLE_PLACES_API_KEY,
  });

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`,
      { signal: AbortSignal.timeout(10000) },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { results?: GooglePlace[] };
    return (json.results || []).map((p) => toPOI(p, category));
  } catch {
    return [];
  }
}

function toPOI(p: GooglePlace, category: POICategory): POI {
  const photoRef = p.photos?.[0]?.photo_reference;
  const brand = detectBrand(p.name) || undefined;
  const poi: POI = {
    id: `google:${p.place_id}`,
    name: p.name,
    category,
    lat: p.geometry.location.lat,
    lng: p.geometry.location.lng,
    distanceFromRouteMi: 0,
    source: "google",
    sourceUrl: `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
    rating: p.rating,
    photoUrl: photoRef
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${env.GOOGLE_PLACES_API_KEY}`
      : undefined,
    blurb: p.vicinity,
    brand,
  };
  if (category === "rest_area" || category === "fuel") {
    const t = toiletRatingFor(p.name);
    if (t != null) poi.toiletRating = t;
  }
  if (category === "fuel") {
    const tier = priceTierFor(p.name);
    if (tier) poi.priceTier = tier;
  }
  return poi;
}
