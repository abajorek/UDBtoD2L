"use client";
import { useCallback, useEffect, useState } from "react";
import type { FinalLegAssignment } from "@/lib/poi/types";
import { TRIP } from "@/lib/trip/route";

const KEY = "otp:final-leg";

export function useVehicleAssignment() {
  const [assignment, setAssignment] = useState<FinalLegAssignment>(
    TRIP.defaultFinalLegAssignment,
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as FinalLegAssignment;
        if (parsed?.tahoe && parsed?.odyssey) setAssignment(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const swap = useCallback(() => {
    setAssignment((prev) => {
      const next: FinalLegAssignment = { tahoe: prev.odyssey, odyssey: prev.tahoe };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { assignment, swap };
}
