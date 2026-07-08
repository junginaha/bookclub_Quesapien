"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

// 카드/도트 색상과 동일한 팔레트 — landing.css .lp-nearby-dot.* 와 통일
const COLOR_MAP: Record<string, string> = {
  navy: "#1B2536",
  cream: "#8B7A5E",
  rust: "#9B4A2E",
  olive: "#5C6B3A",
  dusk: "#4A5568",
  sage: "#7A9E7E",
  terra: "#B07B5C",
  mauve: "#8C6B72",
  fog: "#9CA3AF",
  ink: "#1C1F26",
  ochre: "#B08A4A",
  smoke: "#6B7280",
};

export interface NearbyMapClub {
  slug: string;
  title: string;
  location?: string;
  color?: string;
  lat: number;
  lng: number;
  distKm: number;
  maxParticipants?: number;
  currentParticipants?: number;
}

export default function NearbyClubsMap({
  userLat,
  userLng,
  clubs,
  onOpen,
}: {
  userLat: number;
  userLng: number;
  clubs: NearbyMapClub[];
  onOpen: (slug: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: false,
      }).setView([userLat, userLng], 14);
      mapRef.current = map;

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // 크림 톤 지도 타일 — 사이트 배경과 어울리는 라이트 베이스맵 (무료, 키 불필요)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; OpenStreetMap',
        }
      ).addTo(map);

      // 내 위치 마커
      L.circleMarker([userLat, userLng], {
        radius: 7,
        color: "#fff",
        weight: 2,
        fillColor: "#1C1F26",
        fillOpacity: 1,
      })
        .addTo(map)
        .bindTooltip("내 위치", { direction: "top", offset: [0, -8] });

      const bounds = L.latLngBounds([[userLat, userLng]]);

      clubs.forEach((c) => {
        const color = COLOR_MAP[c.color ?? ""] ?? "#5E4632";
        const seatsLeft = (c.maxParticipants ?? 8) - (c.currentParticipants ?? 0);

        const icon = L.divIcon({
          className: "lnd-map-pin",
          html: `<span style="
            display:block; width:26px; height:26px;
            border-radius:50% 50% 50% 0;
            background:${color};
            transform: rotate(-45deg);
            box-shadow: 0 3px 10px rgba(28,31,38,0.35);
            border: 2px solid #fff;
          "></span>`,
          iconSize: [26, 26],
          iconAnchor: [13, 26],
          popupAnchor: [0, -24],
        });

        const marker = L.marker([c.lat, c.lng], { icon }).addTo(map);
        marker.bindPopup(
          `<div style="font-family:var(--lp-serif-ko,'Noto Serif KR',serif); min-width:150px;">
             <strong style="display:block; margin-bottom:3px; color:#1C1F26;">${escapeHtml(c.title)}</strong>
             ${c.location ? `<span style="font-size:12px; color:#7B7268;">${escapeHtml(c.location)}</span><br/>` : ""}
             <span style="font-size:12px; color:#5E4632;">${c.distKm.toFixed(1)}km · ${seatsLeft}자리 남음</span>
           </div>`
        );
        marker.on("click", () => onOpenRef.current(c.slug));
        bounds.extend([c.lat, c.lng]);
      });

      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLat, userLng, clubs]);

  return <div ref={containerRef} className="lp-nearby-map" aria-label="내 근처 북클럽 지도" />;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
