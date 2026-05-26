"use client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useItinerary } from "@/hooks/useItinerary";
import { TRIP } from "@/lib/trip/route";
import { wazeUrl } from "@/lib/share/waze";
import { CATEGORY_META } from "@/lib/poi/types";

export function ItineraryList() {
  const { entries, remove, clear } = useItinerary();

  if (entries.length === 0) {
    return (
      <Card>
        <h3 className="font-pixel text-[11px] uppercase text-parchment-800 mb-2">
          Your itinerary
        </h3>
        <p className="text-sm text-parchment-700 italic">
          No stops yet. Tap <span className="font-semibold">+ Save</span> on any card to add it.
        </p>
      </Card>
    );
  }

  const byLeg = new Map<string, typeof entries>();
  for (const e of entries) {
    const arr = byLeg.get(e.legId) || [];
    arr.push(e);
    byLeg.set(e.legId, arr);
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-pixel text-[11px] uppercase text-parchment-800">
          Your itinerary ({entries.length})
        </h3>
        <Button variant="ghost" onClick={clear} className="!px-2 !py-1 !text-[10px]">
          Clear
        </Button>
      </div>
      <div className="space-y-4">
        {Array.from(byLeg.entries()).map(([legId, items]) => {
          const leg = TRIP.legs.find((l) => l.id === legId);
          return (
            <div key={legId}>
              <div className="font-pixel text-[10px] uppercase text-parchment-700 mb-2">
                {leg ? `${leg.from.name} → ${leg.to.name}` : legId}
              </div>
              <ul className="space-y-2">
                {items.map((e) => {
                  const meta = CATEGORY_META[e.poiCategory];
                  return (
                    <li
                      key={e.poiId}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span aria-hidden>{meta?.emoji}</span>
                        <span className="truncate text-sm">{e.poiName}</span>
                      </div>
                      <a
                        href={wazeUrl({ lat: e.poiLat, lng: e.poiLng, name: e.poiName })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-pixel px-2 py-1 bg-[#33ccff] text-white border border-parchment-800 hover:brightness-105"
                        title="Open in Waze"
                      >
                        WAZE
                      </a>
                      <button
                        className="text-parchment-700 hover:text-parchment-900 text-base px-1"
                        onClick={() => remove(legId, e.poiId)}
                        aria-label="Remove"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ul>
              {leg && (
                <a
                  href={wazeUrl({ lat: leg.to.lat, lng: leg.to.lng, name: leg.to.name })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 px-3 py-1.5 text-xs font-semibold bg-[#33ccff] text-white border-2 border-parchment-800 shadow-woodcut hover:brightness-105"
                >
                  Drive to {leg.to.name} in Waze →
                </a>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
