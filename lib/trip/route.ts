import type { Trip, Vehicle, Waypoint, Leg } from "@/lib/poi/types";

const VEHICLES: Vehicle[] = [
  { id: "tahoe", label: "2011 Chevy Tahoe", color: "#7d4f1e" },
  { id: "odyssey", label: "2019 Honda Odyssey", color: "#5a7f3a" },
];

const WAYPOINTS: Record<string, Waypoint> = {
  grand_junction: { id: "grand_junction", name: "Grand Junction, CO", lat: 39.0639, lng: -108.5506 },
  hutchinson: { id: "hutchinson", name: "Hutchinson, KS", lat: 38.0608, lng: -97.9298 },
  kansas_city: { id: "kansas_city", name: "Kansas City, MO", lat: 39.0997, lng: -94.5786 },
  pittsburgh: { id: "pittsburgh", name: "Pittsburgh, PA", lat: 40.4406, lng: -79.9959 },
  titusville: { id: "titusville", name: "Titusville, PA", lat: 41.6256, lng: -79.6717 },
};

const LEGS: Leg[] = [
  {
    id: "gj-hut",
    from: WAYPOINTS.grand_junction,
    to: WAYPOINTS.hutchinson,
  },
  {
    id: "hut-kc",
    from: WAYPOINTS.hutchinson,
    to: WAYPOINTS.kansas_city,
  },
  {
    id: "kc-pit",
    from: WAYPOINTS.kansas_city,
    to: WAYPOINTS.pittsburgh,
    branchGroup: "final",
    branchVariant: "via-pittsburgh",
  },
  {
    id: "pit-tit",
    from: WAYPOINTS.pittsburgh,
    to: WAYPOINTS.titusville,
    branchGroup: "final",
    branchVariant: "via-pittsburgh",
  },
  {
    id: "kc-tit-direct",
    from: WAYPOINTS.kansas_city,
    to: WAYPOINTS.titusville,
    branchGroup: "final",
    branchVariant: "direct",
  },
];

export const TRIP: Trip = {
  vehicles: VEHICLES,
  waypoints: Object.values(WAYPOINTS),
  legs: LEGS,
  defaultFinalLegAssignment: {
    tahoe: "kc-pit",
    odyssey: "kc-tit-direct",
  },
};

export function legById(id: string): Leg | undefined {
  return TRIP.legs.find((l) => l.id === id);
}
