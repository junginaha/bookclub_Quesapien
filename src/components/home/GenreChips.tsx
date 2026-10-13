"use client";

import { GENRES, type GenreId } from "@/lib/bookclub/genres";
import styles from "./home-tools.module.css";

// 장르 필터 칩 — 해당 목록에 실제로 있는 장르만 노출한다(빈 칩 방지).
export default function GenreChips({ available, value, onChange, label }: {
  available: Set<GenreId>;
  value: GenreId | "all";
  onChange: (value: GenreId | "all") => void;
  label: string;
}) {
  const genres = GENRES.filter((genre) => available.has(genre.id));
  if (genres.length < 2) return null;
  return (
    <div className={styles.chips} role="group" aria-label={label}>
      {[{ id: "all" as const, label: "전체" }, ...genres].map((genre) => (
        <button
          key={genre.id}
          type="button"
          className={styles.chip}
          aria-pressed={value === genre.id}
          onClick={() => onChange(genre.id)}
        >
          {genre.label}
        </button>
      ))}
    </div>
  );
}
