import { TRIP } from "@/lib/trip/route";
import type { FinalLegAssignment, Leg, VehicleId } from "@/lib/poi/types";

export interface ResolvedRoute {
  vehicleId: VehicleId;
  legs: Leg[];
}

/**
 * Given a vehicle assignment for the final leg, return the ordered legs each vehicle drives.
 * The Pittsburgh detour is two legs (KC→Pittsburgh→Titusville); the direct route is one leg.
 */
export function resolveRoutes(assignment: FinalLegAssignment): ResolvedRoute[] {
  const sharedPrefix = TRIP.legs.filter((l) => !l.branchGroup);

  return TRIP.vehicles.map((v) => {
    const finalId = assignment[v.id];
    const finalLegs: Leg[] = [];
    if (finalId === "kc-pit") {
      const kcPit = TRIP.legs.find((l) => l.id === "kc-pit");
      const pitTit = TRIP.legs.find((l) => l.id === "pit-tit");
      if (kcPit) finalLegs.push(kcPit);
      if (pitTit) finalLegs.push(pitTit);
    } else if (finalId === "kc-tit-direct") {
      const direct = TRIP.legs.find((l) => l.id === "kc-tit-direct");
      if (direct) finalLegs.push(direct);
    }
    return { vehicleId: v.id, legs: [...sharedPrefix, ...finalLegs] };
  });
}

export function swapFinalAssignment(current: FinalLegAssignment): FinalLegAssignment {
  return {
    tahoe: current.odyssey,
    odyssey: current.tahoe,
  };
}
