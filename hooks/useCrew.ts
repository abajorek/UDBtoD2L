"use client";
import { useCallback, useEffect, useState } from "react";
import { DEFAULT_CREW, type Crew } from "@/lib/copy/crew";

const KEY = "otp:crew";

export function useCrew() {
  const [crew, setCrewState] = useState<Crew>(DEFAULT_CREW);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Crew>;
        setCrewState({
          driver: parsed.driver ?? DEFAULT_CREW.driver,
          passengers:
            Array.isArray(parsed.passengers) && parsed.passengers.length > 0
              ? parsed.passengers
              : DEFAULT_CREW.passengers,
          dog: parsed.dog ?? DEFAULT_CREW.dog,
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setCrew = useCallback((next: Crew) => {
    setCrewState(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  return { crew, setCrew };
}
