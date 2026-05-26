import { describe, expect, it } from "vitest";
import { dedupePOIs, jaroWinkler } from "@/lib/poi/dedupe";
import type { POI } from "@/lib/poi/types";

function poi(p: Partial<POI>): POI {
  return {
    id: "x:y",
    name: "Test",
    category: "kitsch",
    lat: 0,
    lng: 0,
    distanceFromRouteMi: 0,
    source: "overpass",
    ...p,
  };
}

describe("jaroWinkler", () => {
  it("returns 1 for identical strings", () => {
    expect(jaroWinkler("foo", "foo")).toBe(1);
  });
  it("scores common-prefix names high", () => {
    expect(jaroWinkler("World's Largest Twine Ball", "Worlds Largest Twine Ball")).toBeGreaterThan(
      0.9,
    );
  });
  it("scores unrelated names low", () => {
    expect(jaroWinkler("Twine Ball", "Drake Well Museum")).toBeLessThan(0.7);
  });
});

describe("dedupePOIs", () => {
  it("collapses near-duplicate POIs and prefers curated source", () => {
    const a = poi({
      id: "overpass:1",
      name: "Cawker City Twine Ball",
      lat: 39.5089,
      lng: -98.4337,
      source: "overpass",
    });
    const b = poi({
      id: "curated:oddities:twine",
      name: "Cawker City Twine Ball",
      lat: 39.5089,
      lng: -98.4337,
      source: "curated:oddities",
    });
    const result = dedupePOIs([a, b]);
    expect(result).toHaveLength(1);
    expect(result[0].source).toBe("curated:oddities");
  });

  it("does NOT collapse same-name POIs far apart", () => {
    const a = poi({ id: "google:1", name: "City Park", lat: 39.5, lng: -98.4, source: "google" });
    const b = poi({ id: "google:2", name: "City Park", lat: 40.4, lng: -79.9, source: "google" });
    const result = dedupePOIs([a, b]);
    expect(result).toHaveLength(2);
  });

  it("keeps POIs that are close but named clearly differently", () => {
    const a = poi({ id: "g:1", name: "Drake Well Museum", lat: 41.61, lng: -79.66 });
    const b = poi({ id: "g:2", name: "Oil Creek Park", lat: 41.611, lng: -79.661 });
    const result = dedupePOIs([a, b]);
    expect(result).toHaveLength(2);
  });
});
