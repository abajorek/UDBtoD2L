import { describe, expect, it } from "vitest";
import {
  haversineMi,
  samplePolyline,
  polylineBBox,
  distanceToPolylineMi,
} from "@/lib/poi/sample";

describe("haversineMi", () => {
  it("computes Grand Junction to Hutchinson at ~600 mi", () => {
    const d = haversineMi(
      { lat: 39.0639, lng: -108.5506 },
      { lat: 38.0608, lng: -97.9298 },
    );
    expect(d).toBeGreaterThan(550);
    expect(d).toBeLessThan(700);
  });
});

describe("samplePolyline", () => {
  it("returns a single point for a single-element input", () => {
    expect(samplePolyline([{ lat: 0, lng: 0 }], 10)).toHaveLength(1);
  });

  it("includes endpoints", () => {
    const line = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 0.5 },
      { lat: 0, lng: 1 },
      { lat: 0, lng: 1.5 },
    ];
    const samples = samplePolyline(line, 50);
    expect(samples[0]).toEqual(line[0]);
    expect(samples[samples.length - 1]).toEqual(line[line.length - 1]);
  });
});

describe("polylineBBox", () => {
  it("expands the bbox by the buffer", () => {
    const bb = polylineBBox(
      [
        { lat: 39, lng: -100 },
        { lat: 40, lng: -90 },
      ],
      10,
    );
    expect(bb.minLat).toBeLessThan(39);
    expect(bb.maxLat).toBeGreaterThan(40);
    expect(bb.minLng).toBeLessThan(-100);
    expect(bb.maxLng).toBeGreaterThan(-90);
  });
});

describe("distanceToPolylineMi", () => {
  it("returns 0 for a point on the polyline", () => {
    const d = distanceToPolylineMi(
      { lat: 39, lng: -100 },
      [
        { lat: 39, lng: -101 },
        { lat: 39, lng: -100 },
        { lat: 39, lng: -99 },
      ],
    );
    expect(d).toBe(0);
  });
});
