import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchPOIsAlong } from "@/lib/poi/merge";
import type { POICategory } from "@/lib/poi/types";

export const runtime = "nodejs";

const Body = z.object({
  polyline: z
    .array(z.object({ lat: z.number(), lng: z.number() }))
    .min(2),
  bufferMi: z.number().min(1).max(50).default(15),
  category: z.enum([
    "dog_walk",
    "pet_friendly_stay",
    "tv_eats",
    "kitsch",
    "rest_area",
    "scenic",
  ]),
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: "invalid body", detail: String(e) }, { status: 400 });
  }
  try {
    const pois = await fetchPOIsAlong({
      category: parsed.category as POICategory,
      polyline: parsed.polyline,
      bufferMi: parsed.bufferMi,
    });
    return NextResponse.json({ pois });
  } catch (e) {
    return NextResponse.json({ error: "lookup failed", detail: String(e) }, { status: 502 });
  }
}
