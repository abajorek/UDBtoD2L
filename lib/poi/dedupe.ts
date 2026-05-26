import type { POI } from "@/lib/poi/types";
import { haversineMi } from "@/lib/poi/sample";

/**
 * Jaro-Winkler similarity, range 0..1. Implementation kept short and inline
 * to avoid a tiny dependency.
 */
export function jaroWinkler(a: string, b: string): number {
  const s1 = a.toLowerCase();
  const s2 = b.toLowerCase();
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const matchDist = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);
  let matches = 0;

  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - matchDist);
    const end = Math.min(i + matchDist + 1, s2.length);
    for (let j = start; j < end; j++) {
      if (s2Matches[j]) continue;
      if (s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  const m = matches;
  const jaro = (m / s1.length + m / s2.length + (m - transpositions / 2) / m) / 3;

  let prefix = 0;
  for (let i = 0; i < Math.min(4, s1.length, s2.length); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }
  return jaro + prefix * 0.1 * (1 - jaro);
}

/**
 * Collapse near-duplicate POIs. Two POIs collapse iff:
 *   - their haversine distance is under `proxMi` (default ~0.1 mi / ~160m), AND
 *   - their name similarity (Jaro-Winkler) is ≥ `nameSim` (default 0.9).
 * Curated sources are preferred over live ones when collapsing.
 */
export function dedupePOIs(
  pois: POI[],
  opts: { proxMi?: number; nameSim?: number } = {},
): POI[] {
  const proxMi = opts.proxMi ?? 0.1;
  const nameSim = opts.nameSim ?? 0.9;

  const sourceRank: Record<POI["source"], number> = {
    "curated:ddd": 0,
    "curated:oddities": 0,
    "curated:waymarks": 0,
    yelp: 1,
    google: 1,
    overpass: 2,
  };

  const sorted = [...pois].sort((a, b) => sourceRank[a.source] - sourceRank[b.source]);
  const kept: POI[] = [];

  for (const p of sorted) {
    const dup = kept.find(
      (k) => haversineMi(k, p) <= proxMi && jaroWinkler(k.name, p.name) >= nameSim,
    );
    if (!dup) kept.push(p);
  }
  return kept;
}
