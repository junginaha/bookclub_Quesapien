"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type BookClubRecord, getEventStart } from "@/lib/bookclub";

function label(club: BookClubRecord) {
  const start = getEventStart(club);
  if (!start) return club.schedule ?? "다음 일정";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(start);
}

export default function MiniBookSpread({ clubs }: { clubs: BookClubRecord[] }) {
  const club = useMemo(() => {
    const sorted = clubs
      .map((item) => ({ item, start: getEventStart(item) }))
      .filter((x): x is { item: BookClubRecord; start: Date } => !!x.start)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
    return sorted.find((x) => x.start.getTime() >= Date.now())?.item ?? sorted[0]?.item ?? null;
  }, [clubs]);

  const [open, setOpen] = useState(false);
  if (!club) return null;

  const summary = club.reason || club.description || "책 한 권과 질문 하나를 들고 만납니다.";

  return (
    <section className="lp-mini-book-section" aria-label="인터랙티브 북클럽 미리보기">
      <div className="lp-mini-book-copy">
        <span>INTERACTIVE BOOK</span>
        <h2>책 펼침은 작게, 하단에서.</h2>
        <p>일정 탐색을 방해하지 않도록 보조 인터랙션으로 옮겼습니다.</p>
      </div>

      <button
        type="button"
        className={`lp-mini-book${open ? " is-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="lp-mini-book-cover">
          <small>QUESTIONING PEOPLE</small>
          <strong>{club.title}</strong>
          <em>{open ? "닫기" : "펼치기 →"}</em>
        </span>
        <span className="lp-mini-book-pages">
          <span className="lp-mini-page left">
            <small>NEXT BOOK CLUB</small>
            <strong>{label(club)}</strong>
            <p>{club.location}</p>
          </span>
          <span className="lp-mini-page right">
            <small>{club.author}</small>
            <p>{summary}</p>
            <Link href={`/bookclub/${club.slug}`} onClick={(event) => event.stopPropagation()}>
              자세히 보기 →
            </Link>
          </span>
        </span>
      </button>
    </section>
  );
}
