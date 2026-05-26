export type VehicleId = "tahoe" | "odyssey";

export interface Vehicle {
  id: VehicleId;
  label: string;
  color: string;
}

export interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Leg {
  id: string;
  from: Waypoint;
  to: Waypoint;
  branchGroup?: "final";
  branchVariant?: "via-pittsburgh" | "direct";
}

export type FinalLegAssignment = Record<VehicleId, Leg["id"]>;

export interface Trip {
  vehicles: Vehicle[];
  waypoints: Waypoint[];
  legs: Leg[];
  defaultFinalLegAssignment: FinalLegAssignment;
}

export type POICategory =
  | "dog_walk"
  | "pet_friendly_stay"
  | "tv_eats"
  | "kitsch"
  | "rest_area"
  | "scenic"
  | "fuel";

export type PriceTier = "cheap" | "average" | "premium";

export type POISource =
  | "yelp"
  | "google"
  | "overpass"
  | "curated:ddd"
  | "curated:oddities"
  | "curated:waymarks";

export interface POI {
  id: string;
  name: string;
  category: POICategory;
  lat: number;
  lng: number;
  distanceFromRouteMi: number;
  source: POISource;
  sourceUrl?: string;
  rating?: number;
  photoUrl?: string;
  blurb?: string;
  /** 1-5 toilet cleanliness rating, brand-derived. Only set for rest_area POIs. */
  toiletRating?: number;
  /** Likely fuel price tier vs. local average. Only set for fuel POIs. */
  priceTier?: PriceTier;
  /** Brand name extracted from the place name, when matched. */
  brand?: string;
}

export interface ItineraryEntry {
  legId: Leg["id"];
  poiId: POI["id"];
  poiName: string;
  poiLat: number;
  poiLng: number;
  poiCategory: POICategory;
  addedAt: number;
  note?: string;
}

export const CATEGORY_META: Record<POICategory, { emoji: string; label: string; color: string }> = {
  dog_walk: { emoji: "🐕", label: "Dogs", color: "#5a7f3a" },
  pet_friendly_stay: { emoji: "🏨", label: "Pet stay", color: "#7d4f1e" },
  tv_eats: { emoji: "📺", label: "TV eats", color: "#a06c2a" },
  kitsch: { emoji: "🎡", label: "Wonders", color: "#bf8e3f" },
  rest_area: { emoji: "🚻", label: "Rest", color: "#7ea7c5" },
  scenic: { emoji: "🌄", label: "Scenic", color: "#5a7f3a" },
  fuel: { emoji: "⛽", label: "Gas", color: "#3b250d" },
};
