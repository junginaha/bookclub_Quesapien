"use client";

import { useEffect, useState } from "react";

export default function BookCoverImage({
  title,
  author,
  fallbackClassName,
}: {
  title: string;
  author: string;
  fallbackClassName?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setUrl(null);
    // Bypass blank responses cached by the previous API implementation.
    const params = new URLSearchParams({ title, author, v: "2" });
    fetch("/api/book-cover?" + params.toString(), { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (active && data?.coverUrl) setUrl(data.coverUrl);
      })
      .catch(() => {});
    return () => { active = false; controller.abort(); };
  }, [title, author]);

  if (!url) {
    return (
      <span className={fallbackClassName} aria-label={title + " 표지 이미지 준비 중"}>
        <span>{title}</span>
        <small>{author}</small>
      </span>
    );
  }

  return (
    <img
      src={url}
      alt={title + " 실제 도서 표지"}
      loading="lazy"
      onError={() => setUrl(null)}
    />
  );
}
