import type { POI, VehicleId } from "@/lib/poi/types";
import type { Crew } from "@/lib/copy/crew";
import {
  DOGS,
  ENGINEERING_WONDER,
  GAS_CONTEXT,
  HEADER_VOICE,
  KITSCH_WONDER,
  ODYSSEY_LORE,
  PET_STAY,
  REST_DESCRIPTIONS,
  ROUTE_SPLIT,
  SCENIC,
  TAHOE_LORE,
  TV_EATS,
  WAZE_HANDOFF,
} from "./phrases";

export interface CopyContext {
  poi?: POI;
  distance?: string;
  activeVehicle?: VehicleId;
  rivalVehicle?: VehicleId;
  crew: Crew;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pick<T>(arr: readonly T[], seed?: string): T {
  if (!arr.length) throw new Error("empty phrase list");
  if (seed === undefined) return arr[Math.floor(Math.random() * arr.length)];
  return arr[hash(seed) % arr.length];
}

const ENGINEERING_KEYWORDS = [
  "museum",
  "library",
  "center",
  "memorial",
  "monument",
  "observatory",
  "laboratory",
  "cosmosphere",
  "strataca",
  "big brutus",
  "drake well",
  "salt mine",
];

function isEngineeringWonder(name: string): boolean {
  const n = name.toLowerCase();
  return ENGINEERING_KEYWORDS.some((k) => n.includes(k));
}

function pickPassenger(crew: Crew, seed?: string): string {
  if (crew.passengers.length === 0) return "the passenger";
  return pick(crew.passengers, seed ? seed + "p" : undefined);
}

/** Format a distance hint, defaulting to a generic one. */
function distanceFor(ctx: CopyContext): string {
  if (ctx.distance) return ctx.distance;
  if (ctx.poi) {
    const mi = ctx.poi.distanceFromRouteMi;
    if (mi < 0.5) return "moments";
    if (mi < 5) return `${Math.round(mi)} miles`;
    return `about ${Math.round(mi / 5) * 5} miles`;
  }
  return "a few miles";
}

/** Compose a Clarkson quote for a specific POI. */
export function quoteForPOI(ctx: CopyContext): string {
  if (!ctx.poi) return pick(HEADER_VOICE);
  const poi = ctx.poi;
  const seed = poi.id;
  switch (poi.category) {
    case "kitsch":
      return isEngineeringWonder(poi.name)
        ? composeEngineeringWonder(poi, seed)
        : composeKitschWonder(poi, ctx, seed);
    case "rest_area":
      return composeRest(poi, seed);
    case "fuel":
      return composeGas(poi, ctx, seed);
    case "dog_walk":
      return composeDogs(poi, ctx, seed);
    case "tv_eats":
      return composeTVEats(poi, ctx, seed);
    case "scenic":
      return pick(SCENIC.intro, seed);
    case "pet_friendly_stay":
      return pick(PET_STAY.intro, seed);
  }
}

function composeEngineeringWonder(poi: POI, seed: string): string {
  const anchor = pick(ENGINEERING_WONDER.anchor, seed + "a");
  const setup = pick(ENGINEERING_WONDER.setup, seed + "s");
  const punch = pick(ENGINEERING_WONDER.punchline, seed + "p");
  return `${anchor} ${setup}. Because just off this highway sits ${poi.name}. ${punch}`;
}

function composeKitschWonder(poi: POI, ctx: CopyContext, seed: string): string {
  const anchor = pick(KITSCH_WONDER.anchor, seed + "a").replace("{distance}", distanceFor(ctx));
  const driverAct = pick(KITSCH_WONDER.driverAction, seed + "d");
  const passengerAct = pick(KITSCH_WONDER.passengerAction, seed + "p");
  const punch = pick(KITSCH_WONDER.punchline, seed + "z");
  const driver = ctx.crew.driver;
  const passenger = pickPassenger(ctx.crew, seed);
  return `${anchor} ${driver} ${driverAct}. ${passenger} ${passengerAct}. And we will confront a monument to absolute local eccentricity — ${poi.name}. ${punch}`;
}

function composeRest(poi: POI, seed: string): string {
  let bucket: readonly string[];
  if ((poi.toiletRating ?? 0) >= 5) bucket = REST_DESCRIPTIONS.palace;
  else if ((poi.toiletRating ?? 0) >= 4) bucket = REST_DESCRIPTIONS.solid;
  else bucket = REST_DESCRIPTIONS.ominous;
  const rating = pick(bucket, seed);
  return `A critical juncture for our bladders approaches. The Toilet-o-Meter assesses ${poi.name}... ${rating}`;
}

function composeGas(poi: POI, ctx: CopyContext, seed: string): string {
  let context: string;
  if (ctx.activeVehicle === "tahoe") context = GAS_CONTEXT.tahoe;
  else if (ctx.activeVehicle === "odyssey") context = GAS_CONTEXT.odyssey;
  else if (poi.priceTier === "cheap") context = GAS_CONTEXT.cheap;
  else if (poi.priceTier === "premium") context = GAS_CONTEXT.premium;
  else context = GAS_CONTEXT.average;
  const distance = distanceFor(ctx);
  const vehicle = ctx.activeVehicle === "tahoe" ? "2011 Tahoe LTZ" : ctx.activeVehicle === "odyssey" ? "2019 Odyssey" : "caravan";
  return `The ${vehicle} is demanding fuel. Fortunately, in ${distance} we can pull over at ${poi.name}. ${context}`.replace(/\s+/g, " ").trim() || pick(HEADER_VOICE, seed);
}

function composeDogs(poi: POI, ctx: CopyContext, seed: string): string {
  const alert = pick(DOGS.alert, seed + "a");
  const action = pick(DOGS.action, seed + "x");
  const vehicleLabel =
    ctx.activeVehicle === "tahoe" ? "Tahoe"
    : ctx.activeVehicle === "odyssey" ? "Odyssey"
    : "vehicle";
  return `Just off this exit lies a sanctuary of green grass: ${poi.name}. ${alert} It is time to unleash the hound. ${ctx.crew.dog} must be released to ${action}, or the interior of the ${vehicleLabel} will face total chaos.`;
}

function composeTVEats(poi: POI, ctx: CopyContext, seed: string): string {
  const intro = pick(TV_EATS.intro, seed + "i");
  const punch = pick(TV_EATS.punchline, seed + "p");
  const distance = distanceFor(ctx);
  return `Forget nutrition. Forget salads. Coming up in ${distance} is ${poi.name}. ${intro}. ${punch}`;
}

export function headerLine(seed?: string): string {
  return pick(HEADER_VOICE, seed);
}

export function wazeNudge(seed?: string): string {
  return pick(WAZE_HANDOFF, seed);
}

export function vehicleLore(v: VehicleId, seed?: string): string {
  return pick(v === "tahoe" ? TAHOE_LORE : ODYSSEY_LORE, seed);
}

export function routeSplit(activeLabel: string, rivalLabel: string): string {
  return pick(ROUTE_SPLIT).replace("{active}", activeLabel).replace("{rival}", rivalLabel);
}
