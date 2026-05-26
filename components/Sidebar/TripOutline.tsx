"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TRIP } from "@/lib/trip/route";
import { resolveRoutes } from "@/lib/trip/branching";
import type { FinalLegAssignment, Leg, POI, POICategory, VehicleId } from "@/lib/poi/types";
import { vehicleLore } from "@/lib/copy/generator";
import { useCrew } from "@/hooks/useCrew";
import { QuoteCallout } from "@/components/ui/QuoteCallout";
import { LegPanel } from "./LegPanel";
import { FlavorText } from "./FlavorText";
import { CrewEditor } from "./CrewEditor";

interface Props {
  assignment: FinalLegAssignment;
  onSwapAssignment: () => void;
  legPolylines: Record<string, { lat: number; lng: number }[]>;
  activeCategories: Set<POICategory>;
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
  const [showCrew, setShowCrew] = useState(false);
  const { crew, setCrew } = useCrew();
  const routes = resolveRoutes(assignment);

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

  // for each leg, find which vehicle drives it (used to flavor the copy)
  const vehicleForLeg = (legId: string): VehicleId | undefined => {
    const r = routes.find((rt) => rt.legs.some((l) => l.id === legId));
    return r?.vehicleId;
  };

  return (
    <div className="space-y-3">
      <header>
        <h1 className="font-pixel text-sm leading-relaxed text-parchment-800">
          THE OREGON TRAIL <br />
          <span className="text-parchment-700">(but east of Kansas)</span>
        </h1>
        <div className="mt-2">
          <FlavorText seed="header" />
        </div>
      </header>

      <Card className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-pixel text-[10px] uppercase text-parchment-800">Your party</h2>
          <button
            onClick={() => setShowCrew((v) => !v)}
            className="font-pixel text-[9px] uppercase text-parchment-700 hover:text-parchment-900 underline decoration-dotted underline-offset-2"
          >
            {showCrew ? "Done" : "Edit names"}
          </button>
        </div>

        {showCrew ? (
          <CrewEditor crew={crew} onChange={setCrew} />
        ) : (
          <div className="text-sm">
            <div className="text-parchment-800">
              <span className="font-semibold">{crew.driver}</span> at the wheel
              {crew.passengers.length > 0 && (
                <>
                  {" · "}
                  <span>with {crew.passengers.join(", ")}</span>
                </>
              )}
              {" · "}
              <span className="italic">🐕 {crew.dog}</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {TRIP.vehicles.map((v) => {
            const route = routes.find((r) => r.vehicleId === v.id);
            const finalLeg = route?.legs.find((l) => l.branchGroup === "final");
            return (
              <div key={v.id} className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
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
                <QuoteCallout
                  text={vehicleLore(v.id, v.id)}
                  label="📜 The saga"
                />
              </div>
            );
          })}
        </div>

        <Button variant="ghost" className="w-full" onClick={onSwapAssignment}>
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
                    activeVehicle={vehicleForLeg(leg.id)}
                    onHoverPOI={onHoverPOI}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
