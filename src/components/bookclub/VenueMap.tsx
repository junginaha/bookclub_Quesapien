"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

/** 지도 SDK(Leaflet 모듈 로드 또는 초기화)가 실패했을 때 보여주는 고정 SVG
 * 핀 일러스트 — 좌표/주소는 텍스트로 그대로 보여주므로 정보 손실은 없다. */
function MapFallback({ label }: { label: string }) {
  return (
    <div className="qd-map qd-map-fallback" role="img" aria-label={`${label} 위치 지도(지도를 불러오지 못했어요)`}>
      <svg viewBox="0 0 48 48" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M24 4c-7.7 0-14 6.1-14 13.6C10 27.9 24 44 24 44s14-16.1 14-26.4C38 10.1 31.7 4 24 4Z"
          fill="#5E4632"
        />
        <circle cx="24" cy="17.5" r="5.5" fill="#fff" />
      </svg>
      <span>{label}</span>
    </div>
  );
}

export default function VenueMap({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
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
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng, label]);

  if (failed) return <MapFallback label={label} />;
  return <div ref={containerRef} className="qd-map" role="img" aria-label={`${label} 위치 지도`} />;
}
