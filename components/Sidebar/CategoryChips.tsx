"use client";
import { Button } from "@/components/ui/Button";
import { CATEGORY_META } from "@/lib/poi/types";
import type { POICategory } from "@/lib/poi/types";

interface Props {
  active: Set<POICategory>;
  onToggle: (c: POICategory) => void;
}

const ORDER: POICategory[] = [
  "kitsch",
  "rest_area",
  "fuel",
  "dog_walk",
  "tv_eats",
  "pet_friendly_stay",
  "scenic",
];

export function CategoryChips({ active, onToggle }: Props) {
  return (
    <div>
      <div className="font-pixel text-[10px] uppercase text-parchment-700 mb-2">
        What are we looking for?
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ORDER.map((c) => {
          const meta = CATEGORY_META[c];
          return (
            <Button
              key={c}
              variant="chip"
              active={active.has(c)}
              onClick={() => onToggle(c)}
              aria-pressed={active.has(c)}
              className="!py-2.5 !text-[11px] flex items-center justify-start gap-2"
            >
              <span className="text-base">{meta.emoji}</span>
              <span className="truncate">{meta.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
