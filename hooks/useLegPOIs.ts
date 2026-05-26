"use client";
import { useCallback, useState } from "react";
import type { POI, POICategory } from "@/lib/poi/types";

interface CacheKey {
  legId: string;
  category: POICategory;
}

const cache = new Map<string, POI[]>();
const keyOf = (k: CacheKey) => `${k.legId}|${k.category}`;

export function useLegPOIs() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const fetchPOIs = useCallback(
    async (
      legId: string,
      polyline: { lat: number; lng: number }[],
      category: POICategory,
    ): Promise<POI[]> => {
      const k = keyOf({ legId, category });
      const cached = cache.get(k);
      if (cached) return cached;

      setLoading((s) => ({ ...s, [k]: true }));
      try {
        const res = await fetch("/api/pois/along", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ polyline, category, bufferMi: 20 }),
        });
        if (!res.ok) return [];
        const json = (await res.json()) as { pois: POI[] };
        cache.set(k, json.pois);
        return json.pois;
      } finally {
        setLoading((s) => ({ ...s, [k]: false }));
      }
    },
    [],
  );

  const isLoading = useCallback(
    (legId: string, category: POICategory) => Boolean(loading[keyOf({ legId, category })]),
    [loading],
  );

  return { fetchPOIs, isLoading };
}
