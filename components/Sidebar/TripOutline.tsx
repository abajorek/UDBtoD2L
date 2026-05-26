"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TRIP } from "@/lib/trip/route";
import { resolveRoutes } from "@/lib/trip/branching";
import { CATEGORY_META } from "@/lib/poi/types";
import type { FinalLegAssignment, Leg, POI, POICategory } from "@/lib/poi/types";
import { LegPanel } from "./LegPanel";
import { FlavorText } from "./FlavorText";

interface Props {
  assignment: FinalLegAssignment;
  onSwapAssignment: () => void;
  legPolylines: Record<string, { lat: number; lng: number }[]>;
  activeCategories: Set<POICategory>;
  onToggleCategory: (c: POICategory) => void;
  onHoverPOI?: (poi: POI | null) => void;
}

export function TripOutline({
  assignment,
  onSwapAssignment,
  legPolylines,
  activeCategories,
  onHoverPOI,
}: Props) {
  const [openLeg, setOpenLeg] = useState<string | null>("gj-hut");
  const routes = resolveRoutes(assignment);

  // collect all legs that appear in either vehicle's route, preserving order
  const seen = new Set<string>();
  const orderedLegs: Leg[] = [];
  for (const r of routes) {
    for (const leg of r.legs) {
      if (!seen.has(leg.id)) {
        seen.add(leg.id);
        orderedLegs.push(leg);
      }
    }
  }

  return (
    <div className="space-y-3">
      <header>
        <h1 className="font-pixel text-sm leading-relaxed text-parchment-800">
          THE OREGON TRAIL <br />
          <span className="text-parchment-700">(but east of Kansas)</span>
        </h1>
        <FlavorText seed="header" />
      </header>

      <Card className="space-y-2">
        <h2 className="font-pixel text-[10px] uppercase text-parchment-800">Your party</h2>
        {TRIP.vehicles.map((v) => {
          const route = routes.find((r) => r.vehicleId === v.id);
          const finalLeg = route?.legs.find((l) => l.branchGroup === "final");
          return (
            <div key={v.id} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block w-3 h-3 border border-parchment-800"
                style={{ backgroundColor: v.color }}
                aria-hidden
              />
              <span className="flex-1">{v.label}</span>
              <span className="text-[10px] font-pixel text-parchment-700">
                {finalLeg?.branchVariant === "via-pittsburgh"
                  ? "via Pittsburgh"
                  : "direct to Titusville"}
              </span>
            </div>
          );
        })}
        <Button variant="ghost" className="w-full mt-1" onClick={onSwapAssignment}>
          Swap final-leg routes
        </Button>
      </Card>

      <div className="space-y-2">
        {orderedLegs.map((leg) => {
          const open = openLeg === leg.id;
          const drivers = routes
            .filter((r) => r.legs.some((l) => l.id === leg.id))
            .map((r) => TRIP.vehicles.find((v) => v.id === r.vehicleId)!);
          return (
            <div key={leg.id}>
              <button
                className="w-full text-left bg-parchment-200 border-2 border-parchment-800 px-3 py-2 shadow-woodcut hover:bg-parchment-300"
                onClick={() => setOpenLeg(open ? null : leg.id)}
                aria-expanded={open}
              >
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-[10px] uppercase flex-1">
                    {leg.from.name} → {leg.to.name}
                  </span>
                  <div className="flex gap-1">
                    {drivers.map((d) => (
                      <span
                        key={d.id}
                        className="inline-block w-2.5 h-2.5 border border-parchment-800"
                        style={{ backgroundColor: d.color }}
                        title={d.label}
                        aria-label={d.label}
                      />
                    ))}
                  </div>
                  <span className="font-pixel text-xs">{open ? "▾" : "▸"}</span>
                </div>
              </button>
              {open && (
                <div className="border-x-2 border-b-2 border-parchment-800 bg-parchment-50 p-3 -mt-px">
                  <LegPanel
                    leg={leg}
                    polyline={legPolylines[leg.id] || []}
                    activeCategories={activeCategories}
                    onHoverPOI={onHoverPOI}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Card>
        <h2 className="font-pixel text-[10px] uppercase text-parchment-800 mb-1">Legend</h2>
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.entries(CATEGORY_META).map(([k, m]) => (
            <span key={k} className="inline-flex items-center gap-1">
              <span>{m.emoji}</span>
              <span className="text-parchment-700">{m.label}</span>
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
