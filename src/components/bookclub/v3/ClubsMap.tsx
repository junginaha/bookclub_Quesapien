"use client";

import { useEffect, useRef } from "react";
import type { BookClubSession } from "@/lib/bookclub/types";

/** 북클럽 찾기 지도 — 좌표 있는 모임만 핀. 내 위치는 권한 허용 시에만 표시. */
export default function ClubsMap({
  sessions,
  user,
  onSelect,
}: {
  sessions: BookClubSession[];
  user: { lat: number; lng: number } | null;
  onSelect: (s: BookClubSession) => void;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !nodeRef.current) return;
      const center: [number, number] = user ? [user.lat, user.lng] : [37.4953, 127.0276];
      const m = L.map(nodeRef.current, { zoomControl: false, attributionControl: true, scrollWheelZoom: false }).setView(center, 12);
      map = m;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(m);
      L.control.zoom({ position: "bottomright" }).addTo(m);
      const bounds: Array<[number, number]> = [];
      if (user) {
        const me = L.divIcon({ className: "qs-map-user-wrap", html: '<span class="qs-map-user"><i></i></span>', iconSize: [30, 30], iconAnchor: [15, 15] });
        L.marker([user.lat, user.lng], { icon: me, zIndexOffset: 1000 }).addTo(m).bindTooltip("현재 위치", { direction: "top", offset: [0, -10] });
        bounds.push([user.lat, user.lng]);
      }
      sessions.forEach((s, i) => {
        const { lat, lng } = s.venue;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        bounds.push([lat, lng]);
        const icon = L.divIcon({ className: "qs-map-club-wrap", html: `<span class="qs-map-club">${i + 1}</span>`, iconSize: [34, 34], iconAnchor: [17, 17] });
        const marker = L.marker([lat, lng], { icon }).addTo(m);
        marker.bindTooltip(`<strong>${s.bookTitle}</strong><br><span>${s.venue.name}</span>`, { direction: "top", offset: [0, -12], className: "qs-map-tooltip" });
        marker.on("click", () => onSelect(s));
      });
      if (bounds.length > 1) m.fitBounds(bounds, { padding: [36, 36], maxZoom: 14 });
      else if (bounds.length === 1) m.setView(bounds[0], 14);
      setTimeout(() => map?.invalidateSize(), 80);
    })();
    return () => { cancelled = true; map?.remove(); };
  }, [sessions, user, onSelect]);

  return <div ref={nodeRef} style={{ width: "100%", height: "100%" }} aria-label="북클럽 지도" />;
}
