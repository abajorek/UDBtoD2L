import type { POI, POICategory } from "@/lib/poi/types";
import ddd from "@/data/curated/ddd_locations.json";
import oddities from "@/data/curated/roadside_oddities.json";
import waymarks from "@/data/curated/waymarks.json";

interface CuratedEntry {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  blurb?: string;
  category?: POICategory;
}

function fromDDD(): POI[] {
  return (ddd.entries as CuratedEntry[]).map((e) => ({
    id: `curated:ddd:${e.id}`,
    name: e.name,
    category: "tv_eats" as POICategory,
    lat: e.lat,
    lng: e.lng,
    distanceFromRouteMi: 0,
    source: "curated:ddd",
    blurb: `${e.city} · ${e.blurb ?? ""}`.trim(),
  }));
}

function fromOddities(): POI[] {
  return (oddities.entries as CuratedEntry[]).map((e) => ({
    id: `curated:oddities:${e.id}`,
    name: e.name,
    category: "kitsch" as POICategory,
    lat: e.lat,
    lng: e.lng,
    distanceFromRouteMi: 0,
    source: "curated:oddities",
    blurb: `${e.city} · ${e.blurb ?? ""}`.trim(),
  }));
}

function fromWaymarks(): POI[] {
  return (waymarks.entries as CuratedEntry[]).map((e) => ({
    id: `curated:waymarks:${e.id}`,
    name: e.name,
    category: (e.category ?? "kitsch") as POICategory,
    lat: e.lat,
    lng: e.lng,
    distanceFromRouteMi: 0,
    source: "curated:waymarks",
    blurb: `${e.city} · ${e.blurb ?? ""}`.trim(),
  }));
}

let _all: POI[] | null = null;
function allCurated(): POI[] {
  if (_all) return _all;
  _all = [...fromDDD(), ...fromOddities(), ...fromWaymarks()];
  return _all;
}

export function curatedFor(category: POICategory): POI[] {
  return allCurated().filter((p) => p.category === category);
}
