"use client";
import { Button } from "@/components/ui/Button";
import { CATEGORY_META } from "@/lib/poi/types";
import type { POICategory } from "@/lib/poi/types";

interface Props {
  active: Set<POICategory>;
  onToggle: (c: POICategory) => void;
}

const ORDER: POICategory[] = [
  "dog_walk",
  "pet_friendly_stay",
  "tv_eats",
  "kitsch",
  "rest_area",
  "scenic",
];

export function CategoryChips({ active, onToggle }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {ORDER.map((c) => {
        const meta = CATEGORY_META[c];
        return (
          <Button
            key={c}
            variant="chip"
            active={active.has(c)}
            onClick={() => onToggle(c)}
            aria-pressed={active.has(c)}
          >
            <span className="mr-1">{meta.emoji}</span>
            {meta.label}
          </Button>
        );
      })}
    </div>
  );
}
