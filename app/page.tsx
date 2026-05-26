"use client";
import { useEffect, useMemo, useState } from "react";
import { TRIP } from "@/lib/trip/route";
import { resolveRoutes } from "@/lib/trip/branching";
import type { POI, POICategory } from "@/lib/poi/types";
import { useVehicleAssignment } from "@/hooks/useVehicleAssignment";
import { CategoryChips } from "@/components/Sidebar/CategoryChips";
import { TripOutline } from "@/components/Sidebar/TripOutline";
import { ItineraryList } from "@/components/Sidebar/ItineraryList";
import { MapView } from "@/components/Map/MapView";

type LegPolylines = Record<string, { lat: number; lng: number }[]>;
type LegPOIs = Record<string, POI[]>;

function interpolatePolyline(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  steps: number,
): { lat: number; lng: number }[] {
  const out: { lat: number; lng: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    out.push({
      lat: from.lat + (to.lat - from.lat) * t,
      lng: from.lng + (to.lng - from.lng) * t,
    });
  }
  return out;
}

export default function Page() {
  const { assignment, swap } = useVehicleAssignment();
  const [activeCategories, setActiveCategories] = useState<Set<POICategory>>(
    () => new Set<POICategory>(["kitsch"]),
  );
  const [legPolylines, setLegPolylines] = useState<LegPolylines>({});
  const [legPOIs, setLegPOIs] = useState<LegPOIs>({});
  const [hoverPOI, setHoverPOI] = useState<POI | null>(null);

  // routes both vehicles drive (after assignment)
  const activeRoutes = useMemo(() => resolveRoutes(assignment), [assignment]);
  const activeLegIds = useMemo(() => {
    const s = new Set<string>();
    for (const r of activeRoutes) for (const l of r.legs) s.add(l.id);
    return s;
  }, [activeRoutes]);

  // fetch directions for each leg as needed
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const legId of activeLegIds) {
        if (legPolylines[legId]) continue;
        const leg = TRIP.legs.find((l) => l.id === legId);
        if (!leg) continue;
        try {
          const res = await fetch("/api/route/segment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              from: { lat: leg.from.lat, lng: leg.from.lng },
              to: { lat: leg.to.lat, lng: leg.to.lng },
            }),
          });
          if (cancelled) return;
          if (res.ok) {
            const json = (await res.json()) as { polyline: { lat: number; lng: number }[] };
            setLegPolylines((p) => ({ ...p, [legId]: json.polyline }));
          } else {
            setLegPolylines((p) => ({
              ...p,
              [legId]: interpolatePolyline(
                { lat: leg.from.lat, lng: leg.from.lng },
                { lat: leg.to.lat, lng: leg.to.lng },
                40,
              ),
            }));
          }
        } catch {
          setLegPolylines((p) => ({
            ...p,
            [legId]: [
              { lat: leg.from.lat, lng: leg.from.lng },
              { lat: leg.to.lat, lng: leg.to.lng },
            ],
          }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeLegIds, legPolylines]);

  // fetch POIs for each active (leg × category)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const legId of activeLegIds) {
        const poly = legPolylines[legId];
        if (!poly || poly.length < 2) continue;
        for (const cat of activeCategories) {
          const k = `${legId}|${cat}`;
          if (legPOIs[k]) continue;
          try {
            const res = await fetch("/api/pois/along", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ polyline: poly, category: cat, bufferMi: 20 }),
            });
            if (cancelled) return;
            if (!res.ok) {
              setLegPOIs((p) => ({ ...p, [k]: [] }));
              continue;
            }
            const json = (await res.json()) as { pois: POI[] };
            setLegPOIs((p) => ({ ...p, [k]: json.pois }));
          } catch {
            setLegPOIs((p) => ({ ...p, [k]: [] }));
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeLegIds, activeCategories, legPolylines, legPOIs]);

  const allVisiblePOIs = useMemo(() => {
    const out: POI[] = [];
    for (const legId of activeLegIds) {
      for (const cat of activeCategories) {
        const arr = legPOIs[`${legId}|${cat}`];
        if (arr) out.push(...arr.slice(0, 8));
      }
    }
    return out;
  }, [activeLegIds, activeCategories, legPOIs]);

  const onToggleCategory = (c: POICategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  return (
    <main className="flex h-screen flex-col md:flex-row">
      <aside className="md:w-[420px] w-full max-h-[55vh] md:max-h-none overflow-y-auto p-4 border-b-2 md:border-b-0 md:border-r-2 border-parchment-800 bg-parchment-50/60 space-y-4">
        <CategoryChips active={activeCategories} onToggle={onToggleCategory} />
        <TripOutline
          assignment={assignment}
          onSwapAssignment={swap}
          legPolylines={legPolylines}
          activeCategories={activeCategories}
          onHoverPOI={setHoverPOI}
        />
        <ItineraryList />
      </aside>
      <section className="flex-1 relative">
        <MapView
          assignment={assignment}
          legPolylines={legPolylines}
          pois={allVisiblePOIs}
          hoverPOI={hoverPOI}
        />
      </section>
    </main>
  );
}
