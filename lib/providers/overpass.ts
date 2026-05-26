import "server-only";
import type { LatLng } from "@/lib/poi/sample";
import type { POI, POICategory } from "@/lib/poi/types";

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.fr/api/interpreter",
];

interface OverpassNode {
  id: number;
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

const QUERIES: Partial<Record<POICategory, (around: string) => string>> = {
  dog_walk: (around) => `
    [out:json][timeout:25];
    (
      node["leisure"="dog_park"](${around});
      node["leisure"="park"](${around});
      way["leisure"="park"](${around});
    );
    out center 30;
  `,
  rest_area: (around) => `
    [out:json][timeout:25];
    (
      node["highway"="rest_area"](${around});
      node["highway"="services"](${around});
      way["highway"="services"](${around});
    );
    out center 30;
  `,
  scenic: (around) => `
    [out:json][timeout:25];
    (
      node["tourism"="viewpoint"](${around});
      node["natural"="peak"](${around});
    );
    out 30;
  `,
  kitsch: (around) => `
    [out:json][timeout:25];
    (
      node["tourism"="attraction"](${around});
      way["tourism"="attraction"](${around});
      node["historic"="monument"](${around});
    );
    out center 30;
  `,
};

export async function searchOverpass(
  point: LatLng,
  category: POICategory,
  radiusMi: number,
): Promise<POI[]> {
  const queryFn = QUERIES[category];
  if (!queryFn) return [];

  const radiusM = Math.round(radiusMi * 1609.344);
  const around = `around:${radiusM},${point.lat},${point.lng}`;
  const body = `data=${encodeURIComponent(queryFn(around))}`;

  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) continue;
      const json = (await res.json()) as { elements: OverpassNode[] };
      return json.elements
        .map((el) => toPOI(el, category))
        .filter((p): p is POI => p !== null);
    } catch {
      continue;
    }
  }
  return [];
}

function toPOI(el: OverpassNode, category: POICategory): POI | null {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (lat === undefined || lng === undefined) return null;
  const name = el.tags?.name;
  if (!name) return null;
  return {
    id: `overpass:${el.type}/${el.id}`,
    name,
    category,
    lat,
    lng,
    distanceFromRouteMi: 0,
    source: "overpass",
    sourceUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
    blurb: tagBlurb(el.tags),
  };
}

function tagBlurb(tags: Record<string, string> | undefined): string | undefined {
  if (!tags) return undefined;
  const parts: string[] = [];
  if (tags.description) parts.push(tags.description);
  if (tags.operator) parts.push(`Operated by ${tags.operator}`);
  return parts.join(" · ") || undefined;
}
