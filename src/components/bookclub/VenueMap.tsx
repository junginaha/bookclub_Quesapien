"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

export default function VenueMap({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: false,
      }).setView([lat, lng], 16);
      mapRef.current = map;

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; OpenStreetMap',
      }).addTo(map);

      const icon = L.divIcon({
        className: "lnd-map-pin",
        html: `<span style="display:block;width:26px;height:26px;border-radius:50% 50% 50% 0;background:#5E4632;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(28,31,38,0.35);border:2px solid #fff;"></span>`,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
      });
      L.marker([lat, lng], { icon }).addTo(map).bindPopup(label);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng, label]);

  return <div ref={containerRef} className="qd-map" role="img" aria-label={`${label} 위치 지도`} />;
}
