import type { PriceTier } from "@/lib/poi/types";

/**
 * Toilet-o-meter: 1-5 cleanliness rating by brand, hand-tuned from
 * road-tripper consensus / regional reputation. Higher = cleaner.
 * Travel-center brands tend to outrank standalone gas-station bathrooms.
 */
const TOILET_BY_BRAND: Record<string, number> = {
  "buc-ee's": 5,
  "buc-ees": 5,
  bucees: 5,
  "love's": 4,
  loves: 4,
  pilot: 4,
  "flying j": 4,
  pilotflyingj: 4,
  ta: 4,
  "ta petro": 4,
  "travel centers of america": 4,
  wawa: 4,
  sheetz: 4,
  quiktrip: 4,
  qt: 4,
  "casey's": 4,
  caseys: 4,
  "kwik trip": 4,
  "kwik star": 4,
  rutter: 3,
  "rutter's": 3,
  "speedway": 3,
  "circle k": 3,
  shell: 3,
  bp: 3,
  exxon: 3,
  mobil: 3,
  chevron: 3,
  conoco: 3,
  phillips: 3,
  "7-eleven": 3,
  "7-11": 3,
  "kum & go": 3,
  "kum and go": 3,
  marathon: 3,
  sunoco: 3,
  citgo: 3,
  valero: 3,
  "76": 3,
  sinclair: 3,
};

/**
 * Likely-cheap fuel brands. Tier reflects typical pricing relative to
 * the local average — "cheap" = members-warehouse / aggressive grocery-loyalty;
 * "premium" = highway / branded convenience.
 */
const FUEL_TIER_BY_BRAND: Record<string, PriceTier> = {
  costco: "cheap",
  "sam's": "cheap",
  sams: "cheap",
  "sam's club": "cheap",
  "murphy usa": "cheap",
  "murphy express": "cheap",
  murphy: "cheap",
  walmart: "cheap",
  kroger: "cheap",
  "kroger fuel": "cheap",
  qt: "cheap",
  quiktrip: "cheap",
  "kum & go": "cheap",
  "kum and go": "cheap",
  "casey's": "cheap",
  caseys: "cheap",
  sheetz: "cheap",
  wawa: "cheap",
  "kwik trip": "cheap",
  speedway: "average",
  marathon: "average",
  shell: "premium",
  bp: "premium",
  exxon: "premium",
  mobil: "premium",
  chevron: "premium",
  "76": "premium",
  sunoco: "premium",
  "buc-ee's": "average", // it IS Buc-ee's though, so people pay anyway
  "love's": "average",
  pilot: "average",
  "flying j": "average",
};

const PRIORITIZED_BRANDS = Array.from(
  new Set([...Object.keys(TOILET_BY_BRAND), ...Object.keys(FUEL_TIER_BY_BRAND)]),
).sort((a, b) => b.length - a.length); // longest first so "kwik trip" beats "kwik"

/** Extract a known brand from a place name. Returns lowercase brand key or null. */
export function detectBrand(name: string): string | null {
  const lower = name.toLowerCase();
  for (const brand of PRIORITIZED_BRANDS) {
    if (lower.includes(brand)) return brand;
  }
  return null;
}

export function toiletRatingFor(name: string): number | undefined {
  const brand = detectBrand(name);
  if (!brand) return undefined;
  return TOILET_BY_BRAND[brand];
}

export function priceTierFor(name: string): PriceTier | undefined {
  const brand = detectBrand(name);
  if (!brand) return undefined;
  return FUEL_TIER_BY_BRAND[brand];
}
