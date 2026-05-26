# Oregon Trail Trip Planner

An Oregon-Trail-themed road trip planning assistant for one specific real trip:

- **Vehicles**: 2011 Chevy Tahoe and 2019 Honda Odyssey.
- **Route**: Grand Junction, CO → Hutchinson, KS → Kansas City, MO → split:
  - one vehicle goes KC → **Pittsburgh, PA → Titusville, PA**
  - the other goes KC → **Titusville, PA** direct
- **Along the way**, helps pick rest stops, dog-walking parks, pet-friendly lodging,
  "as seen on TV" restaurants, kitschy roadside oddities, and scenic overlooks.

Built with Next.js (App Router) + TypeScript + Tailwind + Mapbox GL JS.

## Quickstart

```bash
cp .env.example .env.local
# fill in NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN and MAPBOX_SECRET_TOKEN at minimum
npm install
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable                          | Required? | What it unlocks                                                       | Get one                                              |
| --------------------------------- | --------- | --------------------------------------------------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN` | strongly  | The map itself.                                                       | https://account.mapbox.com/access-tokens/            |
| `MAPBOX_SECRET_TOKEN`             | strongly  | Driving directions / route lines.                                     | same                                                 |
| `YELP_API_KEY`                    | optional  | "As-seen-on-TV" restaurants, pet-friendly hotels, additional parks.   | https://www.yelp.com/developers/v3/manage_app        |
| `GOOGLE_PLACES_API_KEY`           | optional  | Parks, lodging, tourist attractions.                                  | https://console.cloud.google.com/google/maps-apis    |

**No keys?** The app still loads — you'll see waypoints (no route lines) and curated
roadside oddities + DDD restaurants + Overpass-sourced rest areas. Overpass requires no key.

API keys are read **server-side only** via `lib/env.ts` (which uses `server-only`),
so the secret tokens never reach the browser.

## Scripts

- `npm run dev` — Next dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript no-emit check
- `npm test` — Vitest unit tests

## Project structure

```
app/                  Next App Router pages + API route handlers
  api/route/segment/  POST {from,to} → Mapbox Directions polyline
  api/pois/along/     POST {polyline,category,bufferMi} → merged POI list
components/           Map + Sidebar React components
data/curated/         Hand-curated DDD restaurants, roadside oddities, waymarks
hooks/                useItinerary, useLegPOIs, useVehicleAssignment
lib/
  trip/               Trip constant and final-leg branching helpers
  poi/                POI types, dedupe, sampling, merge
  providers/          Server-only Mapbox/Yelp/Google/Overpass clients
  env.ts              Typed env access (server-only)
tests/                Vitest unit tests
```

## How POI search works

Each leg's polyline is sampled at ~N evenly-spaced points. For each sample, the app
queries every provider that handles the selected category in parallel
(`lib/poi/merge.ts` → `PROVIDERS_BY_CATEGORY`). Results are normalized to a shared
`POI` shape, deduped by proximity (~0.1 mi haversine) + name similarity (Jaro-Winkler ≥ 0.9),
filtered to within `bufferMi` of the route, and sorted by distance-from-route.

Curated JSON files (`data/curated/*.json`) are merged in alongside live results,
so the app remains useful with zero API keys and survives provider outages.

## Adding curated stops

Edit the JSON files under `data/curated/`. The shape is:

```json
{
  "_meta": { "manual": true, "source": "..." },
  "entries": [
    {
      "id": "stable-id",
      "name": "Display name",
      "city": "City, ST",
      "lat": 39.0,
      "lng": -100.0,
      "blurb": "Optional one-liner"
    }
  ]
}
```

`ddd_locations.json` entries map to category `tv_eats`, `roadside_oddities.json` to
`kitsch`, and `waymarks.json` accepts an explicit `category` field.

## Notes & known limitations

- **Waymarking.com has no public REST API.** `waymarks.json` is a small manual import;
  add more entries by hand.
- **Mapbox free tier** allows ~50k Directions calls/month. The server caches responses
  in-memory per process (`lib/cache/lru.ts`).
- **Yelp categories have been narrowing.** DDD lookups use both `categories=restaurants`
  and `term="diners drive ins dives"` and post-filter.
- **Overpass public endpoints** occasionally time out; the client rotates across
  three mirrors with one retry.
- **Itinerary persistence** is just `localStorage` under key `otp:itinerary`. No accounts.

## Future ideas (not built)

- GitHub Actions CI for lint + typecheck + test on push.
- Export itinerary to GPX / Google Maps "My Maps".
- Real driving-distance estimates between selected stops (currently just route polyline).
- Hours-of-operation overlay for selected POIs.
