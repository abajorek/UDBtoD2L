import "server-only";

export const env = {
  MAPBOX_SECRET_TOKEN: process.env.MAPBOX_SECRET_TOKEN || "",
  YELP_API_KEY: process.env.YELP_API_KEY || "",
  GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY || "",
};

export function hasKey(name: keyof typeof env): boolean {
  return env[name].length > 0;
}

const warned = new Set<string>();
export function warnMissingOnce(name: keyof typeof env): void {
  if (!warned.has(name) && !hasKey(name)) {
    warned.add(name);
    console.warn(`[oregon-trail] ${name} not set — that data source will be skipped.`);
  }
}
