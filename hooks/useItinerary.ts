"use client";
import { useCallback, useEffect, useState } from "react";
import type { ItineraryEntry, POI } from "@/lib/poi/types";

const KEY = "otp:itinerary";

function read(): ItineraryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ItineraryEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: ItineraryEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(entries));
}

export function useItinerary() {
  const [entries, setEntries] = useState<ItineraryEntry[]>([]);

  useEffect(() => {
    setEntries(read());
  }, []);

  const add = useCallback((legId: string, poi: POI) => {
    setEntries((prev) => {
      if (prev.some((e) => e.legId === legId && e.poiId === poi.id)) return prev;
      const next = [...prev, { legId, poiId: poi.id, addedAt: Date.now() }];
      write(next);
      return next;
    });
  }, []);

  const remove = useCallback((legId: string, poiId: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => !(e.legId === legId && e.poiId === poiId));
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    write([]);
    setEntries([]);
  }, []);

  const has = useCallback(
    (legId: string, poiId: string) => entries.some((e) => e.legId === legId && e.poiId === poiId),
    [entries],
  );

  return { entries, add, remove, clear, has };
}
