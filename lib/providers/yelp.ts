import "server-only";
import type { LatLng } from "@/lib/poi/sample";
import type { POI, POICategory } from "@/lib/poi/types";
import { env, warnMissingOnce } from "@/lib/env";

interface YelpBusiness {
  id: string;
  name: string;
  url: string;
  coordinates: { latitude: number; longitude: number };
  rating?: number;
  image_url?: string;
  categories?: { alias: string; title: string }[];
  price?: string;
}

const QUERIES: Partial<Record<POICategory, { term?: string; categories?: string }>> = {
  tv_eats: { term: "diners drive ins dives", categories: "restaurants" },
  pet_friendly_stay: { term: "pet friendly hotel", categories: "hotels" },
  dog_walk: { term: "dog park", categories: "active" },
};

export async function searchYelp(
  point: LatLng,
  category: POICategory,
  radiusMi: number,
): Promise<POI[]> {
  if (!env.YELP_API_KEY) {
    warnMissingOnce("YELP_API_KEY");
    return [];
  }
  const q = QUERIES[category];
  if (!q) return [];

  const params = new URLSearchParams({
    latitude: String(point.lat),
    longitude: String(point.lng),
    radius: String(Math.min(40000, Math.round(radiusMi * 1609.344))),
    limit: "20",
    sort_by: "best_match",
  });
  if (q.term) params.set("term", q.term);
  if (q.categories) params.set("categories", q.categories);

  try {
    const res = await fetch(`https://api.yelp.com/v3/businesses/search?${params}`, {
      headers: { Authorization: `Bearer ${env.YELP_API_KEY}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { businesses?: YelpBusiness[] };
    return (json.businesses || []).map((b) => toPOI(b, category));
  } catch {
    return [];
  }
}

function toPOI(b: YelpBusiness, category: POICategory): POI {
  return {
    id: `yelp:${b.id}`,
    name: b.name,
    category,
    lat: b.coordinates.latitude,
    lng: b.coordinates.longitude,
    distanceFromRouteMi: 0,
    source: "yelp",
    sourceUrl: b.url,
    rating: b.rating,
    photoUrl: b.image_url,
    blurb: b.categories?.map((c) => c.title).join(", "),
  };
}
