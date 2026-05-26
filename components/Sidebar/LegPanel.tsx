"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CATEGORY_META } from "@/lib/poi/types";
import type { Leg, POI, POICategory } from "@/lib/poi/types";
import { useLegPOIs } from "@/hooks/useLegPOIs";
import { useItinerary } from "@/hooks/useItinerary";
import { FlavorText } from "./FlavorText";

interface Props {
  leg: Leg;
  polyline: { lat: number; lng: number }[];
  activeCategories: Set<POICategory>;
  onHoverPOI?: (poi: POI | null) => void;
}

export function LegPanel({ leg, polyline, activeCategories, onHoverPOI }: Props) {
  const { fetchPOIs, isLoading } = useLegPOIs();
  const { add, remove, has } = useItinerary();
  const [poisByCategory, setPoisByCategory] = useState<Record<string, POI[]>>({});

  useEffect(() => {
    if (polyline.length < 2) return;
    let cancelled = false;
    (async () => {
      for (const cat of activeCategories) {
        if (poisByCategory[cat]) continue;
        const results = await fetchPOIs(leg.id, polyline, cat);
        if (cancelled) return;
        setPoisByCategory((p) => ({ ...p, [cat]: results }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeCategories, polyline, leg.id, fetchPOIs, poisByCategory]);

  const visible = Array.from(activeCategories);

  return (
    <div className="space-y-3">
      {visible.length === 0 && (
        <FlavorText seed={leg.id + "-empty"} />
      )}
      {visible.map((cat) => {
        const meta = CATEGORY_META[cat];
        const pois = poisByCategory[cat];
        const loading = isLoading(leg.id, cat);
        return (
          <div key={cat}>
            <h4 className="font-pixel text-[10px] uppercase text-parchment-800 mb-1">
              {meta.emoji} {meta.label}
            </h4>
            {loading && (
              <p className="font-pixel text-[9px] text-parchment-700">Loading...</p>
            )}
            {pois && pois.length === 0 && (
              <p className="font-pixel text-[9px] text-parchment-700">
                Nothing of note. Keep driving.
              </p>
            )}
            {pois && pois.length > 0 && (
              <ul className="space-y-2">
                {pois.slice(0, 8).map((poi) => {
                  const inItin = has(leg.id, poi.id);
                  return (
                    <li key={poi.id}>
                      <Card
                        className="cursor-pointer hover:bg-parchment-100"
                        onMouseEnter={() => onHoverPOI?.(poi)}
                        onMouseLeave={() => onHoverPOI?.(null)}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{meta.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold leading-tight">
                              {poi.name}
                            </div>
                            {poi.blurb && (
                              <div className="text-xs text-parchment-700 mt-0.5">
                                {poi.blurb}
                              </div>
                            )}
                            <div className="text-[10px] text-parchment-600 mt-1 font-pixel">
                              {poi.distanceFromRouteMi.toFixed(1)} mi off route
                              {poi.rating != null && ` · ${poi.rating}★`}
                              {" · "}
                              <span className="opacity-70">{poi.source}</span>
                            </div>
                          </div>
                          <Button
                            variant={inItin ? "primary" : "ghost"}
                            onClick={() =>
                              inItin ? remove(leg.id, poi.id) : add(leg.id, poi)
                            }
                            aria-label={inItin ? "Remove from itinerary" : "Add to itinerary"}
                          >
                            {inItin ? "✓" : "+"}
                          </Button>
                        </div>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
