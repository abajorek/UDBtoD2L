import { describe, expect, it } from "vitest";
import {
  headerLine,
  quoteForPOI,
  vehicleLore,
  wazeNudge,
} from "@/lib/copy/generator";
import type { POI } from "@/lib/poi/types";
import { DEFAULT_CREW } from "@/lib/copy/crew";

const poi = (p: Partial<POI>): POI => ({
  id: "x:y",
  name: "Test",
  category: "kitsch",
  lat: 0,
  lng: 0,
  distanceFromRouteMi: 2,
  source: "overpass",
  ...p,
});

describe("quoteForPOI", () => {
  it("uses engineering template for the Cosmosphere", () => {
    const q = quoteForPOI({
      poi: poi({ id: "c", name: "Cosmosphere", category: "kitsch" }),
      crew: DEFAULT_CREW,
    });
    expect(q).toMatch(/Cosmosphere/);
    expect(q.length).toBeGreaterThan(50);
  });

  it("uses kitsch template with crew names for a roadside oddity", () => {
    const q = quoteForPOI({
      poi: poi({ id: "twine", name: "World's Largest Ball of Twine" }),
      crew: { ...DEFAULT_CREW, driver: "Andrew", passengers: ["Sarah"] },
    });
    expect(q).toMatch(/Andrew/);
    expect(q).toMatch(/Sarah/);
    expect(q).toMatch(/twine/i);
  });

  it("uses palace tier for a 5-star toilet rating", () => {
    const q = quoteForPOI({
      poi: poi({
        id: "bucees",
        name: "Buc-ee's #34",
        category: "rest_area",
        toiletRating: 5,
      }),
      crew: DEFAULT_CREW,
    });
    expect(q).toMatch(/palace|gold standard|plumbing|porcelain/i);
  });

  it("uses the Tahoe gas context when active vehicle is tahoe", () => {
    const q = quoteForPOI({
      poi: poi({ id: "costco", name: "Costco Gasoline", category: "fuel", priceTier: "cheap" }),
      activeVehicle: "tahoe",
      crew: DEFAULT_CREW,
    });
    expect(q).toMatch(/225,000|LTZ|V8/);
  });

  it("uses the dog's name in dog_walk copy", () => {
    const q = quoteForPOI({
      poi: poi({ id: "park", name: "Riverside Park", category: "dog_walk" }),
      crew: { ...DEFAULT_CREW, dog: "Rosie" },
    });
    expect(q).toMatch(/Rosie/);
  });
});

describe("vehicleLore", () => {
  it("references Tahoe mileage", () => {
    expect(vehicleLore("tahoe", "x")).toMatch(/225|U-Haul|Tahoe/);
  });
  it("references the Odyssey saga", () => {
    expect(vehicleLore("odyssey", "x")).toMatch(/Odyssey|minivan|stolen|GEICO/i);
  });
});

describe("headerLine + wazeNudge", () => {
  it("returns deterministic results for the same seed", () => {
    expect(headerLine("a")).toBe(headerLine("a"));
    expect(wazeNudge("b")).toBe(wazeNudge("b"));
  });
});
