"use client";

import { useEffect, useRef } from "react";
import type { BookClubSession } from "@/lib/bookclub/types";

export default function NearbyBookclubMap({
  user,
  results,
  onSelect,
}: {
  user: { lat: number; lng: number };
  results: Array<{ session: BookClubSession; km: number }>;
  onSelect: (session: BookClubSession) => void;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !nodeRef.current) return;

      const activeMap = L.map(nodeRef.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: false,
      }).setView([user.lat, user.lng], 13);
      map = activeMap;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      const me = L.divIcon({
        className: "qs-map-user-wrap",
        html: '<span class="qs-map-user"><i></i></span>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      L.marker([user.lat, user.lng], { icon: me, zIndexOffset: 1000 })
        .addTo(map)
        .bindTooltip("현재 위치", { direction: "top", offset: [0, -10] });

      const bounds: Array<[number, number]> = [[user.lat, user.lng]];
      results.forEach(({ session, km }, index) => {
        const { lat, lng } = session.venue;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        bounds.push([lat, lng]);
        const icon = L.divIcon({
          className: "qs-map-club-wrap",
          html: `<span class="qs-map-club">${index + 1}</span>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });
        const marker = L.marker([lat, lng], { icon }).addTo(activeMap);
        marker.bindTooltip(
          `<strong>${session.bookTitle}</strong><br><span>${session.venue.name} · ${km < 1 ? Math.round(km * 1000) + "m" : km.toFixed(1) + "km"}</span>`,
          { direction: "top", offset: [0, -12], className: "qs-map-tooltip" }
        );
        marker.on("click", () => onSelect(session));
      });

      if (bounds.length > 1) map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14 });
      setTimeout(() => map?.invalidateSize(), 80);
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [user.lat, user.lng, results, onSelect]);

  return <div ref={nodeRef} style={{ width: "100%", height: "100%" }} aria-label="현재 위치 주변 북클럽 지도" />;
}
