"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CATEGORY_META } from "@/lib/poi/types";
import type { Leg, POI, POICategory } from "@/lib/poi/types";
import { useLegPOIs } from "@/hooks/useLegPOIs";
import { useItinerary } from "@/hooks/useItinerary";
import { wazeUrlForPOI } from "@/lib/share/waze";
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
    <div className="space-y-4">
      {visible.length === 0 && <FlavorText seed={leg.id + "-empty"} />}
      {visible.map((cat) => {
        const meta = CATEGORY_META[cat];
        const pois = poisByCategory[cat];
        const loading = isLoading(leg.id, cat);
        return (
          <div key={cat}>
            <h4 className="font-pixel text-[11px] uppercase text-parchment-800 mb-2 flex items-center gap-2">
              <span className="text-base">{meta.emoji}</span>
              {meta.label}
            </h4>
            {loading && (
              <p className="text-sm text-parchment-700 italic">Looking around...</p>
            )}
            {pois && pois.length === 0 && (
              <p className="text-sm text-parchment-700 italic">
                Nothing of note. On we go.
              </p>
            )}
            {pois && pois.length > 0 && (
              <ul className="space-y-3">
                {pois.slice(0, 6).map((poi) => (
                  <POICard
                    key={poi.id}
                    poi={poi}
                    legId={leg.id}
                    inItinerary={has(leg.id, poi.id)}
                    onAdd={() => add(leg.id, poi)}
                    onRemove={() => remove(leg.id, poi.id)}
                    onHover={onHoverPOI}
                  />
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface CardProps {
  poi: POI;
  legId: string;
  inItinerary: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onHover?: (poi: POI | null) => void;
}

function POICard({ poi, inItinerary, onAdd, onRemove, onHover }: CardProps) {
  return (
    <li>
      <Card
        className="hover:bg-parchment-100 transition-colors"
        onMouseEnter={() => onHover?.(poi)}
        onMouseLeave={() => onHover?.(null)}
      >
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-base font-semibold leading-tight text-parchment-900">
                {poi.name}
              </div>
              {poi.blurb && (
                <div className="text-sm text-parchment-700 mt-1 leading-snug">
                  {poi.blurb}
                </div>
              )}
              <div className="text-xs text-parchment-600 mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5">
                <span>{poi.distanceFromRouteMi.toFixed(1)} mi off route</span>
                {poi.rating != null && <span>· {poi.rating.toFixed(1)}★</span>}
                {poi.toiletRating != null && (
                  <span title="Toilet-o-meter (brand-based)">· 🧻 {poi.toiletRating}/5</span>
                )}
                {poi.priceTier && (
                  <span title="Likely gas price tier (brand-based)">
                    · {priceTierBadge(poi.priceTier)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={wazeUrlForPOI(poi)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 text-sm font-semibold text-center bg-[#33ccff] text-white border-2 border-parchment-800 shadow-woodcut hover:brightness-105 active:translate-x-[1px] active:translate-y-[1px]"
            >
              Open in Waze
            </a>
            <Button
              variant={inItinerary ? "primary" : "ghost"}
              onClick={inItinerary ? onRemove : onAdd}
              className="!px-3 !py-2"
              aria-label={inItinerary ? "Remove from itinerary" : "Add to itinerary"}
              title={inItinerary ? "Remove from itinerary" : "Add to itinerary"}
            >
              {inItinerary ? "✓ Saved" : "+ Save"}
            </Button>
          </div>
        </div>
      </Card>
    </li>
  );
}

function priceTierBadge(tier: "cheap" | "average" | "premium"): string {
  if (tier === "cheap") return "$ likely cheap";
  if (tier === "premium") return "$$$ likely pricey";
  return "$$ average";
}
