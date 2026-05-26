"use client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useItinerary } from "@/hooks/useItinerary";
import { TRIP } from "@/lib/trip/route";

export function ItineraryList() {
  const { entries, remove, clear } = useItinerary();

  if (entries.length === 0) {
    return (
      <Card>
        <h3 className="font-pixel text-[10px] uppercase text-parchment-800 mb-2">
          Your itinerary
        </h3>
        <p className="font-pixel text-[9px] text-parchment-700">
          No stops yet. Click + on any POI to add it.
        </p>
      </Card>
    );
  }

  // group by leg
  const byLeg = new Map<string, typeof entries>();
  for (const e of entries) {
    const arr = byLeg.get(e.legId) || [];
    arr.push(e);
    byLeg.set(e.legId, arr);
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-pixel text-[10px] uppercase text-parchment-800">
          Your itinerary ({entries.length})
        </h3>
        <Button variant="ghost" onClick={clear}>
          Clear
        </Button>
      </div>
      <div className="space-y-3">
        {Array.from(byLeg.entries()).map(([legId, items]) => {
          const leg = TRIP.legs.find((l) => l.id === legId);
          return (
            <div key={legId}>
              <div className="font-pixel text-[9px] uppercase text-parchment-700 mb-1">
                {leg ? `${leg.from.name} → ${leg.to.name}` : legId}
              </div>
              <ul className="space-y-1">
                {items.map((e) => (
                  <li
                    key={e.poiId}
                    className="flex items-center justify-between text-xs gap-2"
                  >
                    <span className="truncate flex-1">{e.poiId.split(":").slice(-1)}</span>
                    <button
                      className="text-parchment-700 hover:text-parchment-900 font-pixel text-[9px]"
                      onClick={() => remove(legId, e.poiId)}
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
