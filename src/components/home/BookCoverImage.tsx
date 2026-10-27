"use client";

import { useEffect, useState } from "react";
import "./book-cover.css";

// 차분한 표지 색(배경, 글자) — 제목으로 하나를 고정 선택한다.
const COVER_TONES: [string, string][] = [
  ["#173b75", "#f5efd8"],
  ["#2f4a3f", "#f1ead8"],
  ["#7a3b2e", "#f6ecdd"],
  ["#4a3a5c", "#f2eadf"],
  ["#8a6a3d", "#fbf5e8"],
  ["#2d3b4f", "#efe7d4"],
  ["#e8dfd1", "#2a2f38"],
];

function toneFor(title: string): [string, string] {
  let h = 0;
  for (const ch of title) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return COVER_TONES[h % COVER_TONES.length];
}

type BookCoverProps = {
  title: string;
  author: string;
  coverUrl?: string;
  isbn?: string;
  fallbackClassName?: string;
  priority?: boolean;
};

// All book surfaces share the same explicit-cover/API/fallback policy.
// Remount on book changes so an old cover cannot flash for a different book.
export default function BookCoverImage(props: BookCoverProps) {
  return <ResolvedBookCover key={JSON.stringify([props.title, props.author, props.coverUrl, props.isbn])} {...props} />;
}

function ResolvedBookCover({
  title,
  author,
  coverUrl,
  isbn,
  fallbackClassName,
  priority = false,
}: BookCoverProps) {
  const [url, setUrl] = useState<string | null>(coverUrl || null);
  const [lookup, setLookup] = useState(!coverUrl);

  useEffect(() => {
    if (!lookup) return;
    let active = true;
    const controller = new AbortController();
    const params = new URLSearchParams({ title, author, v: "4" });
    if (isbn) params.set("isbn", isbn);
    fetch("/api/book-cover?" + params.toString(), { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (active && data?.coverUrl) setUrl(data.coverUrl);
      })
      .catch(() => {});
    return () => { active = false; controller.abort(); };
  }, [title, author, isbn, lookup]);

  if (!url) {
    const [bg, ink] = toneFor(title);
    return (
      <span
        className={"q-typecover" + (fallbackClassName ? " " + fallbackClassName : "")}
        style={{ ["--q-cover-bg" as string]: bg, ["--q-cover-ink" as string]: ink }}
        role="img"
        aria-label={`『${title}』${author ? ` ${author}` : ""}`}
      >
        <span className="q-typecover__rule" aria-hidden="true" />
        <span className="q-typecover__title">{title}</span>
        <span>
          {author && <small className="q-typecover__author">{author}</small>}
          <em className="q-typecover__mark">QSAPIENS</em>
        </span>
      </span>
    );
  }

  return (
    <img
      src={url}
      alt={title + " 실제 도서 표지"}
      loading={priority ? "eager" : "lazy"}
      onLoad={(e) => {
        // 1px·"이미지 없음" 같은 자리표시 이미지는 표지로 쓰지 않는다
        const img = e.currentTarget;
        if (img.naturalWidth < 80 || img.naturalHeight < 100) { setUrl(null); setLookup(false); }
      }}
      onError={() => { setUrl(null); setLookup(url === coverUrl && !!coverUrl); }}
    />
  );
}
