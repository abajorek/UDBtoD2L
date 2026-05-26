import { NextResponse } from "next/server";
import { z } from "zod";
import { getDirections } from "@/lib/providers/mapbox";

export const runtime = "nodejs";

const Body = z.object({
  from: z.object({ lat: z.number(), lng: z.number() }),
  to: z.object({ lat: z.number(), lng: z.number() }),
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: "invalid body", detail: String(e) }, { status: 400 });
  }
  try {
    const result = await getDirections(parsed.from, parsed.to);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: "routing failed", detail: String(e) }, { status: 502 });
  }
}
