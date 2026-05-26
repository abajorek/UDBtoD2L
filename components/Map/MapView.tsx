"use client";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { TRIP } from "@/lib/trip/route";
import { resolveRoutes } from "@/lib/trip/branching";
import type { FinalLegAssignment, POI } from "@/lib/poi/types";
import { CATEGORY_META } from "@/lib/poi/types";

interface Props {
  assignment: FinalLegAssignment;
  legPolylines: Record<string, { lat: number; lng: number }[]>;
  pois: POI[];
  hoverPOI?: POI | null;
}

export function MapView({ assignment, legPolylines, pois, hoverPOI }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const hoverMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // init map once
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;
    if (!token || !containerRef.current) return;
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [-95, 39.5],
      zoom: 4,
    });
    mapRef.current = map;

    map.on("load", () => {
      // waypoint markers
      for (const wp of TRIP.waypoints) {
        const el = document.createElement("div");
        el.style.cssText =
          "width:18px;height:18px;border:2px solid #3b250d;background:#f5e9c8;border-radius:50%;box-shadow:2px 2px 0 0 #3b250d;";
        new mapboxgl.Marker({ element: el })
          .setLngLat([wp.lng, wp.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 16 }).setHTML(
              `<strong>${wp.name}</strong>`,
            ),
          )
          .addTo(map);
      }

      // fit to all waypoints
      const bounds = new mapboxgl.LngLatBounds();
      for (const wp of TRIP.waypoints) bounds.extend([wp.lng, wp.lat]);
      map.fitBounds(bounds, { padding: 60, duration: 0 });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // render route lines whenever polylines or assignment change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      const routes = resolveRoutes(assignment);
      for (const v of TRIP.vehicles) {
        const route = routes.find((r) => r.vehicleId === v.id);
        if (!route) continue;
        const coords: [number, number][] = [];
        for (const leg of route.legs) {
          const poly = legPolylines[leg.id];
          if (!poly || poly.length === 0) {
            coords.push([leg.from.lng, leg.from.lat], [leg.to.lng, leg.to.lat]);
          } else {
            for (const p of poly) coords.push([p.lng, p.lat]);
          }
        }
        const srcId = `route-${v.id}`;
        const lyrId = `route-${v.id}-line`;
        const data: GeoJSON.Feature<GeoJSON.LineString> = {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: coords },
        };
        const src = map.getSource(srcId) as mapboxgl.GeoJSONSource | undefined;
        if (src) {
          src.setData(data);
        } else {
          map.addSource(srcId, { type: "geojson", data });
          map.addLayer({
            id: lyrId,
            type: "line",
            source: srcId,
            paint: {
              "line-color": v.color,
              "line-width": 5,
              "line-opacity": 0.85,
            },
          });
        }
      }
    };
    if (map.loaded()) apply();
    else map.once("load", apply);
  }, [assignment, legPolylines]);

  // render POI markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const m of markersRef.current) m.remove();
    markersRef.current = [];

    for (const poi of pois) {
      const meta = CATEGORY_META[poi.category];
      const el = document.createElement("div");
      el.style.cssText =
        `width:26px;height:26px;border:2px solid #3b250d;background:${meta.color};` +
        `color:#f5e9c8;border-radius:50%;display:flex;align-items:center;justify-content:center;` +
        `font-size:14px;box-shadow:2px 2px 0 0 #3b250d;cursor:pointer;`;
      el.textContent = meta.emoji;
      el.title = poi.name;
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([poi.lng, poi.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 16 }).setHTML(
            `<strong>${escapeHtml(poi.name)}</strong>` +
              (poi.blurb ? `<br/><span>${escapeHtml(poi.blurb)}</span>` : "") +
              `<br/><small>${meta.label} · ${poi.source}</small>`,
          ),
        )
        .addTo(map);
      markersRef.current.push(marker);
    }
  }, [pois]);

  // hover focus marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (hoverMarkerRef.current) {
      hoverMarkerRef.current.remove();
      hoverMarkerRef.current = null;
    }
    if (!hoverPOI) return;
    const el = document.createElement("div");
    el.style.cssText =
      "width:38px;height:38px;border:3px solid #3b250d;background:transparent;border-radius:50%;pointer-events:none;animation:pulse 1s ease-out infinite;";
    hoverMarkerRef.current = new mapboxgl.Marker({ element: el })
      .setLngLat([hoverPOI.lng, hoverPOI.lat])
      .addTo(map);
    map.flyTo({ center: [hoverPOI.lng, hoverPOI.lat], zoom: Math.max(map.getZoom(), 7) });
  }, [hoverPOI]);

  const hasToken = Boolean(process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="absolute inset-0" />
      {!hasToken && (
        <div className="absolute inset-0 flex items-center justify-center bg-parchment-100/80 p-6">
          <div className="max-w-md text-center font-pixel text-xs text-parchment-800">
            Set <code>NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN</code> in <code>.env.local</code> to see
            the map.
          </div>
        </div>
      )}
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
